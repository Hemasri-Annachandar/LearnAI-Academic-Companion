import os
import asyncio
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

async def main():
    api_key = os.getenv("NEXUS_API_KEY")
    base_url = os.getenv("NEXUS_BASE_URL")

    if not api_key or not base_url:
        print("Missing Nexus API key or Base URL in .env")
        return

    client = AsyncOpenAI(api_key=api_key, base_url=base_url)

    try:
        models = await client.models.list()

        print("\nAvailable Nexus models:\n")

        for model in models.data:
            print(model.id)

    except Exception as error:
        print("Model listing failed:", type(error).__name__)
        print(str(error))

    finally:
        await client.close()

asyncio.run(main())