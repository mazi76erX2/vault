import hashlib
import os
from pathlib import Path

import requests
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    HnswParameters,
    HnswVectorSearchAlgorithmConfiguration,
    PrioritizedFields,
    SearchableField,
    SearchField,
    SearchFieldDataType,
    SemanticConfiguration,
    SemanticField,
    SemanticSettings,
    SimpleField,
    VectorSearch,
)
from azure.search.documents.indexes.models import SearchIndex
from dotenv import load_dotenv
from langchain.text_splitter import CharacterTextSplitter
from openai import AzureOpenAI

# Load .env from current directory
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

AZURE_SEARCH_ENDPOINT = os.environ["AZURE_SEARCH_ENDPOINT"]
AZURE_SEARCH_KEY = os.environ["AZURE_SEARCH_KEY"]


## TODO INSERT FILE_URL
def update_document_in_kb(search_client, doc, splitter, ids):
    doc_id = generate_doc_id(doc["metadata"])

    # Step 1: Delete old chunks
    search_client.delete_documents(ids)

    # Step 2: Re-split the document and upload new chunks
    chunks = splitter.split_text(doc["content"])
    datas = []
    for i, chunk in enumerate(chunks):
        chunk_id = f"{doc_id}_chunk_{i + 1}"
        data = {
            "id": chunk_id,
            "doc_id": doc_id,
            "chunk_index": i + 1,
            "content": chunk,
            "sourcefile": doc["metadata"]["file_url"],
            "title": doc["metadata"]["file_name"],
            "created_date": doc["metadata"]["createdDateTime"],
            "last_modified_date": doc["metadata"]["lastModifiedDateTime"],
            "created_by": doc["metadata"]["createdBy"],
            "last_modified_by": doc["metadata"]["lastModifiedBy"],
            "access_level": 1,
        }
        datas.append(data)
    search_client.upload_documents(datas)


def generate_doc_id(file_name, file_url):
    unique_str = f"{file_name}_{file_url}"
    return hashlib.md5(unique_str.encode()).hexdigest()


def generate_chunk_ids(doc_id, num_chunks):
    return [f"{doc_id}_chunk_{i}" for i in range(1, num_chunks + 1)]


def get_index(name: str) -> SearchIndex:
    """
    Returns an Azure Cognitive Search index with the given name.
    """
    fields = [
        SimpleField(name="id", type=SearchFieldDataType.String, key=True),
        SearchableField(name="doc_id", type=SearchFieldDataType.String),
        SimpleField(name="chunk_index", type=SearchFieldDataType.Int32),
        SimpleField(name="sourcefile", type=SearchFieldDataType.String),
        SimpleField(name="title", type=SearchFieldDataType.String),
        SimpleField(name="created_date", type=SearchFieldDataType.String),
        SimpleField(name="last_modified_date", type=SearchFieldDataType.String),
        SimpleField(name="created_by", type=SearchFieldDataType.String),
        SimpleField(name="last_modified_by", type=SearchFieldDataType.String),
        SimpleField(name="access_level", type=SearchFieldDataType.Int32),
        SearchableField(name="content", type=SearchFieldDataType.String),
        SearchField(
            name="embedding",
            type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
            vector_search_dimensions=1536,
            vector_search_configuration="default",
        ),
    ]

    semantic_settings = SemanticSettings(
        configurations=[
            SemanticConfiguration(
                name="default",
                prioritized_fields=PrioritizedFields(
                    title_field=None,
                    prioritized_content_fields=[SemanticField(field_name="content")],
                ),
            )
        ]
    )

    vector_search = VectorSearch(
        algorithm_configurations=[
            HnswVectorSearchAlgorithmConfiguration(
                name="default",
                kind="hnsw",
                parameters=HnswParameters(metric="cosine"),
            )
        ]
    )

    index = SearchIndex(
        name=name,
        fields=fields,
        semantic_settings=semantic_settings,
        vector_search=vector_search,
    )

    return index


def store_in_azure_kb_sharepoint(doc, search_client, clientOpenAI, kb_index):

    # Initialize Azure Cognitive Search client
    search_index_client = SearchIndexClient(
        AZURE_SEARCH_ENDPOINT, AzureKeyCredential(AZURE_SEARCH_KEY)
    )

    datas = []
    splitter = CharacterTextSplitter(separator="\n", chunk_size=5000, chunk_overlap=20)

    # Process each text document
    chunks = splitter.split_text(doc["content"])
    doc_id = generate_doc_id(doc["metadata"]["file_name"], doc["metadata"]["file_url"])

    datas = []
    for i, chunk in enumerate(chunks):
        chunk_id = f"{doc_id}_chunk_{i + 1}"  # Combine doc_id and chunk index
        data = {
            "id": chunk_id,
            "doc_id": doc_id,
            "chunk_index": i + 1,
            "content": chunk,
            "sourcefile": doc["metadata"]["file_url"],
            "title": doc["metadata"]["file_name"],
            "created_date": doc["metadata"]["createdDateTime"],
            "last_modified_date": doc["metadata"]["lastModifiedDateTime"],
            "created_by": doc["metadata"]["createdBy"],
            "last_modified_by": doc["metadata"]["lastModifiedBy"],
            "access_level": 1,
        }
        datas.append(data)

    for doc in datas:
        doc["embedding"] = (
            clientOpenAI.embeddings.create(
                input=doc["content"], model="embedding-rag-confluence"
            )
            .data[0]
            .embedding
        )

    # Create an Azure Cognitive Search index
    index = get_index(kb_index)
    search_index_client.create_or_update_index(index)

    # Upload data to the index

    search_client.upload_documents(datas)


def check_doc_in_index(search_client, doc_id, last_modified_date):
    """
    Check if a document with the given doc_id exists in the Azure Cognitive Search index.

    Args:
        search_client (SearchClient): An instance of the Azure Cognitive Search client.
        doc_id (str): The unique document ID to search for.

    Returns:
        bool: True if the document exists, False otherwise.
    """
    query = doc_id
    results = search_client.search(
        query, search_fields=["doc_id"]
    )  # Limit results to 1 for efficiency
    ids = []
    is_old = False
    for result in results:  # If any result exists, the doc_id is in the index
        if doc_id == result.get("doc_id"):
            is_old = True
            if last_modified_date != result.get("last_modified_date"):
                ids.append(result.get("id"))
    return ids, is_old


class SharePointClient:
    def __init__(self, tenant_id, client_id, client_secret, resource_url, index):
        self.tenant_id = tenant_id
        self.client_id = client_id
        self.index = index
        self.client_secret = client_secret
        self.resource_url = resource_url
        self.base_url = (
            f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
        )
        self.headers = {"Content-Type": "application/x-www-form-urlencoded"}
        self.access_token = (
            self.get_access_token()
        )  # Initialize and store the access token upon instantiation
        self.search_client = SearchClient(
            endpoint=AZURE_SEARCH_ENDPOINT,
            index_name=self.index,
            credential=AzureKeyCredential(AZURE_SEARCH_KEY),
        )
        self.clientOpenAI = AzureOpenAI(
            azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
            api_key=os.environ["AZURE_OPENAI_KEY"],
            api_version="2024-02-15-preview",
        )

    def get_access_token(self):
        # Body for the access token request
        body = {
            "grant_type": "client_credentials",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "scope": self.resource_url + ".default",
        }
        response = requests.post(self.base_url, headers=self.headers, data=body)
        return response.json().get(
            "access_token"
        )  # Extract access token from the response

    def get_site_id(self, site_url):
        # Build URL to request site ID
        full_url = f"https://graph.microsoft.com/v1.0/sites/{site_url}"
        response = requests.get(
            full_url, headers={"Authorization": f"Bearer {self.access_token}"}
        )
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
        folder_url = f"https://graph.microsoft.com/v1.0/sites/{site_id}/drives/{drive_id}/root/children"
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
                folder_dict[item["name"]] = item[
                    "id"
                ]  # Add name as key and ID as value

        return folder_dict

    # Recursive function to browse folders
    def list_folder_contents(
        self, site_id, drive_id, folder_id, current_path="", level=0
    ):
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
                    "createdBy": item.get("createdBy", {})
                    .get("user", {})
                    .get("displayName"),
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
            print(
                f"Failed to download {file_name}: {response.status_code} - {response.reason}"
            )

    def create_document(self, item, text_content):
        doc = {
            "metadata": {
                "file_name": item["name"],
                "full_path": item["full_path"],
                "file_url": item["web_url"],
                "createdBy": item.get("createdBy"),
                "lastModifiedBy": item.get("lastModifiedBy"),
                "createdDateTime": item.get("createdDateTime"),
                "lastModifiedDateTime": item.get("lastModifiedDateTime"),
            },
            "content": text_content,
        }
        return doc

    def download_folder_contents(
        self, site_id, drive_id, folder_id, local_folder_path, level=0
    ):
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
                    file_name = item["name"]
                    file_download_url = f"{self.resource_url}/v1.0/sites/{site_id}/drives/{drive_id}/items/{item['id']}/content"
                    self.download_file(file_download_url, local_folder_path, file_name)

    def extract_file_content(self, download_url, local_path, file_name):
        allowed_extensions = ["pdf", "docx"]
        headers = {"Authorization": f"Bearer {self.access_token}"}
        text_content = ""
        response = requests.get(download_url, headers=headers)

        if response.status_code == 200:
            full_path = os.path.join(local_path, file_name)

            extension = file_name.split(".")[1]
            if extension in allowed_extensions:
                # check here if there is a new version

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
            print(
                f"Failed to process {file_name}: {response.status_code} - {response.reason}"
            )

        return text_content

    def extract_folder_contents(
        self, site_id, drive_id, folder_id, local_folder_path, level=0
    ):
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
                        doc = self.create_document(item, content)
                        # to do
                        #      store in KB
                        store_in_azure_kb(doc)

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
        Recursively process folder contents from SharePoint:
        - Lists items in the given folder (files and subfolders)
        - For subfolders: creates local dirs (if local_folder_path provided), recurses
        - For files: downloads, extracts text, creates doc layout, stores in KB

        :param site_id: The SharePoint site ID
        :param drive_id: The drive ID (document library)
        :param folder_id: The current folder item ID
        :param current_path: The hierarchical path for metadata (e.g. /Shared Documents/...)
        :param local_folder_path: Local directory to save files if needed (optional)
        :param level: Depth level of recursion, for logging/debugging (optional)
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
                    "web_url": item["webUrl"],
                    "createdBy": item.get("createdBy", {})
                    .get("user", {})
                    .get("displayName"),
                    "lastModifiedBy": item.get("lastModifiedBy", {})
                    .get("user", {})
                    .get("displayName"),
                    "createdDateTime": item.get("createdDateTime"),
                    "lastModifiedDateTime": item.get("lastModifiedDateTime"),
                }

                if "folder" in item:
                    # It's a folder
                    base_item["type"] = "Folder"
                    base_item["mimeType"] = None

                    # If we want to mirror structure locally
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
                    base_item["type"] = "File"
                    base_item["mimeType"] = item["file"]["mimeType"]

                    file_id = item["id"]
                    file_name = item_name
                    if ".mp4" not in item_name:
                        file_download_url = f"{self.resource_url}v1.0/sites/{site_id}/drives/{drive_id}/items/{file_id}/content"

                        doc_id = generate_doc_id(file_name, item["webUrl"])
                        ids, is_old = check_doc_in_index(
                            self.search_client,
                            doc_id,
                            base_item["lastModifiedDateTime"],
                        )

                        if len(ids) > 0:
                            print(f"the file: {file_name} deleted from the KB")

                            self.search_client.delete_documents(ids)
                            content = self.extract_file_content(
                                file_download_url, local_folder_path, file_name
                            )

                            if content.strip():
                                # Create a doc layout with metadata + content
                                doc = self.create_document(base_item, content)
                                # Store doc in KB
                                store_in_azure_kb(
                                    doc,
                                    self.search_client,
                                    self.clientOpenAI,
                                    self.index,
                                )
                                print(f"the file: {file_name} stored in the KB")
                        if not is_old:
                            content = self.extract_file_content(
                                file_download_url, local_folder_path, file_name
                            )

                            if content.strip():
                                # Create a doc layout with metadata + content
                                doc = self.create_document(base_item, content)
                                # Store doc in KB
                                store_in_azure_kb(
                                    doc,
                                    self.search_client,
                                    self.clientOpenAI,
                                    self.index,
                                )
                                print(f"the file: {file_name} stored in the KB")

        # No explicit return needed, as we're processing items as we go.
