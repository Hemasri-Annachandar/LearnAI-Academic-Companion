import asyncio
from dotenv import load_dotenv
from openai import AsyncOpenAI
import os

load_dotenv(override=True)

async def main():
    client = AsyncOpenAI(
        api_key=os.getenv("NEXUS_API_KEY"),
        base_url=os.getenv("NEXUS_BASE_URL")
    )

    try:
        response = await client.chat.completions.create(
            model="nova-micro",
            messages=[
                {"role": "user", "content": "Say hello in simple words."}
            ]
        )

        print("SUCCESS!")
        print(response.choices[0].message.content)

    except Exception as error:
        print("FAILED:", type(error).__name__)
        print("DETAIL:", str(error))

    finally:
        await client.close()

asyncio.run(main())