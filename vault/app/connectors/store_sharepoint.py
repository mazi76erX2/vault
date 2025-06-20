
import argparse

from store_data_in_kb import store_sharepoint_in_azure_kb, store_confluence_in_azure_kb, store_confluence_in_qdrant



def main(args):
    hostname = "highcoordinationde.sharepoint.com"
    sitepath = "Hicohome"
    index = "hicovault_devk"
    confluence_url = "https://hicogroupconfluence.atlassian.net/wiki"
    username = "aziz.raies@hico-group.com"
    api_key = "ATATT3xFfGF07ldiknu3KkNT8mWE_B4dJ9eD3-JX37NJad84-4mzxpe5_vGqDsIwTybokaYPvzLEDtbNkgRsMjll5E0mZb9SG_VBoUtxRAha_3LM5rA1VzDaMHlSFnmuwUPZSZFRH2Wtuh7XM4gCZcGR1b5gA_iTtkFsKTFOTmTbLG2lQmwaL-o=619CE624"
    space_key = "HACC"
    # store_sharepoint_in_azure_kb(hostname, sitepath, index)

    # store_confluence_in_azure_kb(confluence_url, username, api_key, space_key, index)
    store_confluence_in_qdrant(confluence_url, username, api_key, space_key,
                               collection_name="confluence-kb")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--folder_path", type=str, default=r"C:\Users\ars\OneDrive - highcoordination.de\KnowledgeBaseProjects\KB_docs", help="Path to the folder containing .txt files.")
    args = parser.parse_args()
    main(args)
