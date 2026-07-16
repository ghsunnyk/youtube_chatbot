from langchain_huggingface import HuggingFaceEndpoint, ChatHuggingFace
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

from .config import HF_TOKEN, LLM_REPO_ID, RETRIEVER_K
from .vectorstore import get_or_create_vectorstore

PROMPT_TEMPLATE = """
You are a helpful assistant that answers questions about YouTube videos.

You are given the following extracted content from a YouTube video and a
question. Provide a conversational answer based on the content provided.

If the answer is not contained within the content below, say "I don't know."
Do not try to make up an answer.

Context: {Context}
Question: {Question}

Answer in Markdown:
"""


def _build_chain():
    llm = HuggingFaceEndpoint(
        repo_id=LLM_REPO_ID,
        task="text-generation",
        temperature=0.6,
        huggingfacehub_api_token=HF_TOKEN,
    )
    model = ChatHuggingFace(llm=llm)

    prompt = PromptTemplate(
        template=PROMPT_TEMPLATE,
        input_variables=["Context", "Question"],
    )

    return prompt | model | StrOutputParser()


class YoutubeChatbot:
    """Connects a video's vector store to the LLM chain for Q&A.

    Instantiating this class replaces the need to run
    create_memory_for_llm.py and connect_memory_with_llm.py separately -
    it builds the vector store if missing, then loads it for retrieval.
    """

    def __init__(self, video_id: str):
        self.video_id = video_id

        db = get_or_create_vectorstore(video_id)
        if db is None:
            raise ValueError(
                f"Could not build a vector store for video '{video_id}' "
                "(no transcript available)."
            )

        self.retriever = db.as_retriever(search_kwargs={"k": RETRIEVER_K})
        self.chain = _build_chain()

    def ask(self, question: str) -> str:
        docs = self.retriever.invoke(question)
        context = "\n\n".join(doc.page_content for doc in docs)
        return self.chain.invoke({"Context": context, "Question": question})
