import hashlib
import os
from pathlib import Path

import requests

# Remove Azure Search & AzureOpenAI dependencies; route to Qdrant
from dotenv import load_dotenv

from app.connectors.store_data_in_kb import store_in_qdrant

# Load .env from current directory
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# Qdrant collection setting (used when storing documents)
QDRANT_COLLECTION = os.environ.get("QDRANT_COLLECTION", "vault")


def generate_doc_id(file_name, file_url):
    unique_str = f"{file_name}_{file_url}"
    return hashlib.md5(unique_str.encode()).hexdigest()


def generate_chunk_ids(doc_id, num_chunks):
    return [f"{doc_id}_chunk_{i}" for i in range(1, num_chunks + 1)]


def store_in_kb_sharepoint(doc):
    """Store a processed SharePoint document into Qdrant using existing wrapper."""
    # doc expected to include metadata and content
    store_in_qdrant(doc, collection_name=QDRANT_COLLECTION)


class SharePointClient:
    def __init__(self, tenant_id, client_id, client_secret, resource_url, index):
        self.tenant_id = tenant_id
        self.client_id = client_id
        self.index = index
        self.client_secret = client_secret
        self.resource_url = resource_url
        self.base_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
        self.headers = {"Content-Type": "application/x-www-form-urlencoded"}
        self.access_token = self.get_access_token()

    def get_access_token(self):
        # Body for the access token request
        body = {
            "grant_type": "client_credentials",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "scope": self.resource_url + ".default",
        }
        response = requests.post(self.base_url, headers=self.headers, data=body)
        return response.json().get("access_token")

    def get_site_id(self, site_url):
        # Build URL to request site ID
        full_url = f"https://graph.microsoft.com/v1.0/sites/{site_url}"
        response = requests.get(full_url, headers={"Authorization": f"Bearer {self.access_token}"})
        return response.json().get("id")  # Return the site ID

    def get_drive_id(self, site_id):
        # Retrieve drive IDs and names associated with a site
        drives_url = f"https://graph.microsoft.com/v1.0/sites/{site_id}/drives"
        response = requests.get(
            drives_url, headers={"Authorization": f"Bearer {self.access_token}"}
        )
        drives = response.json().get("value", [])
        return [(drive["id"], drive["name"]) for drive in drives]

    # def get_folder_content(self, site_id, drive_id, folder_path='root'):
    #     # Get the contents of a folder
    #     folder_url = f'https://graph.microsoft.com/v1.0/sites/{site_id}/drives/{drive_id}/root/children'
    #     response = requests.get(folder_url, headers={'Authorization': f'Bearer {self.access_token}'})
    #     items_data = response.json()
    #     rootdir = []
    #     if 'value' in items_data:
    #         for item in items_data['value']:
    #             rootdir.append((item['id'], item['name']))
    #     return rootdir
    def get_folder_content(self, site_id, drive_id, folder_path="root"):
        """
        Get the contents of a folder and return a dictionary with folder names as keys and IDs as values.
        """
        # URL to fetch folder content
        folder_url = (
            f"https://graph.microsoft.com/v1.0/sites/{site_id}/drives/{drive_id}/root/children"
        )
        # Make the API request
        response = requests.get(
            folder_url, headers={"Authorization": f"Bearer {self.access_token}"}
        )
        items_data = response.json()

        # Initialize the dictionary
        folder_dict = {}

        # Process items in the response
        if "value" in items_data:
            for item in items_data["value"]:
                folder_dict[item["name"]] = item["id"]  # Add name as key and ID as value

        return folder_dict

    # Recursive function to browse folders
    def list_folder_contents(self, site_id, drive_id, folder_id, current_path="", level=0):
        folder_contents_url = f"https://graph.microsoft.com/v1.0/sites/{site_id}/drives/{drive_id}/items/{folder_id}/children"
        contents_headers = {"Authorization": f"Bearer {self.access_token}"}
        contents_response = requests.get(folder_contents_url, headers=contents_headers)
        folder_contents = contents_response.json()

        items_list = []

        if "value" in folder_contents:
            for item in folder_contents["value"]:
                item_name = item["name"]
                file_path = f"{current_path}/{item_name}" if current_path else item_name

                base_item = {
                    "name": item_name,
                    "id": item["id"],
                    "full_path": file_path,
                    "createdBy": item.get("createdBy", {}).get("user", {}).get("displayName"),
                    "lastModifiedBy": item.get("lastModifiedBy", {})
                    .get("user", {})
                    .get("displayName"),
                    "createdDateTime": item.get("createdDateTime"),
                    "lastModifiedDateTime": item.get("lastModifiedDateTime"),
                }

                if "folder" in item:
                    base_item["type"] = "Folder"
                    base_item["mimeType"] = None
                    items_list.append(base_item)
                    # Recurse into the folder
                    items_list.extend(
                        self.list_folder_contents(
                            site_id, drive_id, item["id"], file_path, level + 1
                        )
                    )
                elif "file" in item:
                    base_item["type"] = "File"
                    base_item["mimeType"] = item["file"]["mimeType"]
                    items_list.append(base_item)

        return items_list

    def download_file(self, download_url, local_path, file_name):
        headers = {"Authorization": f"Bearer {self.access_token}"}
        response = requests.get(download_url, headers=headers)
        if response.status_code == 200:
            full_path = os.path.join(local_path, file_name)
            with open(full_path, "wb") as file:
                file.write(response.content)
            print(f"File downloaded: {full_path}")
        else:
            print(f"Failed to download {file_name}: {response.status_code} - {response.reason}")

    def create_document(self, item, text_content):
        doc = {
            "file_name": item["name"],
            "file_url": item.get("web_url") or item.get("webUrl"),
            "file_title": item["name"],
            "content": text_content,
            "level": 1,
        }
        return doc

    def download_folder_contents(self, site_id, drive_id, folder_id, local_folder_path, level=0):
        # Recursively download all contents from a folder
        folder_contents_url = f"https://graph.microsoft.com/v1.0/sites/{site_id}/drives/{drive_id}/items/{folder_id}/children"
        contents_headers = {"Authorization": f"Bearer {self.access_token}"}
        contents_response = requests.get(folder_contents_url, headers=contents_headers)
        folder_contents = contents_response.json()

        if "value" in folder_contents:
            for item in folder_contents["value"]:
                if "folder" in item:
                    new_path = os.path.join(local_folder_path, item["name"])
                    if not os.path.exists(new_path):
                        os.makedirs(new_path)
                    self.download_folder_contents(
                        site_id, drive_id, item["id"], new_path, level + 1
                    )  # Recursive call for subfolders
                elif "file" in item:
                    item["name"]
                    f"{self.resource_url}/v1.0/sites/{site_id}/drives/{drive_id}/items/{item['id']}/content"
                    # self.download_file(local_path, file_name)  # TODO: local_path is undefined

    def extract_file_content(self, download_url, local_path, file_name):
        allowed_extensions = ["pdf", "docx"]
        headers = {"Authorization": f"Bearer {self.access_token}"}
        text_content = ""
        response = requests.get(download_url, headers=headers)

        if response.status_code == 200:
            full_path = os.path.join(local_path, file_name)

            extension = file_name.split(".")[-1]
            if extension in allowed_extensions:
                with open(full_path, "wb") as file:
                    file.write(response.content)
                if extension == "pdf":
                    from app.utils import readpdf

                    text_content = readpdf(full_path)
                elif extension == "docx":
                    from app.utils import extract_text_with_docx2python

                    text_content = extract_text_with_docx2python(full_path)

            print(f"File procesed: {full_path}")
        else:
            print(f"Failed to process {file_name}: {response.status_code} - {response.reason}")

        return text_content

    def extract_folder_contents(self, site_id, drive_id, folder_id, local_folder_path, level=0):
        # Recursively download all contents from a folder
        folder_contents_url = f"https://graph.microsoft.com/v1.0/sites/{site_id}/drives/{drive_id}/items/{folder_id}/children"
        contents_headers = {"Authorization": f"Bearer {self.access_token}"}
        contents_response = requests.get(folder_contents_url, headers=contents_headers)
        folder_contents = contents_response.json()

        if "value" in folder_contents:
            for item in folder_contents["value"]:
                if "folder" in item:
                    new_path = os.path.join(local_folder_path, item["name"])
                    if not os.path.exists(new_path):
                        os.makedirs(new_path)
                    self.extract_folder_contents(
                        site_id, drive_id, item["id"], new_path, level + 1
                    )  # Recursive call for subfolders
                elif "file" in item:
                    file_name = item["name"]
                    file_download_url = f"{self.resource_url}/v1.0/sites/{site_id}/drives/{drive_id}/items/{item['id']}/content"
                    content = self.extract_file_content(
                        file_download_url, local_folder_path, file_name
                    )
                    if content != "":
                        self.create_document(item, content)
                        # to do
                        #      store in KB
                        # store_in_azure_kb(doc)  # TODO: Function not implemented

    def process_folder_contents(
        self,
        site_id,
        drive_id,
        folder_id,
        current_path="",
        local_folder_path="",
        level=0,
    ):
        """
        Recursively process folder contents from SharePoint and store files in Qdrant.
        """
        folder_contents_url = f"https://graph.microsoft.com/v1.0/sites/{site_id}/drives/{drive_id}/items/{folder_id}/children"
        contents_headers = {"Authorization": f"Bearer {self.access_token}"}
        contents_response = requests.get(folder_contents_url, headers=contents_headers)
        folder_contents = contents_response.json()

        if "value" in folder_contents:
            for item in folder_contents["value"]:
                item_name = item["name"]
                file_path = f"{current_path}/{item_name}" if current_path else item_name

                # Common metadata extraction
                base_item = {
                    "name": item_name,
                    "id": item["id"],
                    "full_path": file_path,
                    "web_url": item.get("webUrl"),
                    "createdBy": item.get("createdBy", {}).get("user", {}).get("displayName"),
                    "lastModifiedBy": item.get("lastModifiedBy", {})
                    .get("user", {})
                    .get("displayName"),
                    "createdDateTime": item.get("createdDateTime"),
                    "lastModifiedDateTime": item.get("lastModifiedDateTime"),
                }

                if "folder" in item:
                    # It's a folder
                    if local_folder_path:
                        new_local_path = os.path.join(local_folder_path, item_name)
                        if not os.path.exists(new_local_path):
                            os.makedirs(new_local_path)
                    else:
                        new_local_path = local_folder_path

                    # Recurse into subfolder
                    self.process_folder_contents(
                        site_id,
                        drive_id,
                        item["id"],
                        current_path=file_path,
                        local_folder_path=new_local_path,
                        level=level + 1,
                    )

                elif "file" in item:
                    # It's a file
                    if ".mp4" not in item_name:
                        file_id = item["id"]
                        file_name = item_name
                        file_download_url = f"{self.resource_url}v1.0/sites/{site_id}/drives/{drive_id}/items/{file_id}/content"

                        content = self.extract_file_content(
                            file_download_url, local_folder_path, file_name
                        )

                        if content.strip():
                            doc = self.create_document(base_item, content)
                            # to do
                            #      store in KB
                            store_in_kb_sharepoint(doc)

        # No explicit return needed
