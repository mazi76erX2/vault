def generate_unstructured_doc(summary, tags, employee_contact, link, title, responsible, levels):
    """
    Generates an unstructured document combining the summary and metadata.

    Parameters:
    - summary (str): The summary of the chat.
    - metadata (dict): A dictionary containing metadata such as tags, employee contact, and link.

    Returns:
    - unstructured_doc (str): The combined unstructured document as a string.
    """
    metadata = {
        "tags": tags,
        "employee_contact": employee_contact,
        "link": link,
        "responsible": responsible,
        "title": title,
        "level": levels,
    }
    # Extract metadata
    tags = metadata.get("tags", [])
    employee_contact = metadata.get("employee_contact", "Not Provided")
    link = metadata.get("link", "Not Provided")
    title = metadata.get("title", "Not Provided")
    level = metadata.get("level", "Not Provided")
    responsible = metadata.get("responsible", "Not Provided")

    # Convert tags list to a comma-separated string
    tags_str = ", ".join(tags)

    levels_map = {"Low": 1, "Medium": 2, "High": 3, "Critical": 4}
    # Create the unstructured document
    unstructured_doc = f"""
        Summary:

        {summary}

        Metadata:
        - Tags: {tags_str}
        - Employee Contact: {employee_contact}
        - Link: {link}
        - Title: {title}
        - Responsible: {responsible}
        - Level: {levels_map[level]}
        - Status: "pending"
        """

    return unstructured_doc
