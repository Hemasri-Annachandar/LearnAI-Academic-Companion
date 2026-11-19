from services.retrieval_service import retrieve_relevant_chunks

question = "interactive textbooks and automated lesson plan generation"

context, sources = retrieve_relevant_chunks(question)

print("SOURCES FOUND:", len(sources))

for source in sources:
    print("File:", source["filename"])
    print("Page:", source["page"])
    print("Chunk:", source["chunk_id"])
    print("Score:", source["score"])
    print("-------------------------")

print("\nRETRIEVED CONTEXT:\n")
print(context)
