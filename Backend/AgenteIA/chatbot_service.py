from Backend.Core.config import settings
import httpx
from dotenv import load_dotenv

load_dotenv()

TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions"
TOGETHER_API_KEY = settings.TOGETHER_API_KEY

HEADERS = {
    "Authorization": f"Bearer {TOGETHER_API_KEY}",
    "Content-Type": "application/json"
}

MODEL_NAME = "meta-llama/Llama-3.3-70B-Instruct-Turbo"

prompt = """{"role": "system", "content": "Eres un asistente inteligente especializado en criptomonedas y finanzas. Tienes acceso a herramientas externas que te permiten realizar tareas avanzadas cuando sea necesario.
        Tu objetivo es ayudar al usuario de forma clara, útil y precisa. Si consideras que puedes responder por tu cuenta, hazlo directamente. Pero si la consulta requiere una herramienta específica, debes usarla.
        No expliques por qué necesitas usar la herramienta. No añadas texto antes o después. Solo usa ese formato si necesitas una herramienta.
        Tienes disponibles las siguientes herramientas:
        
        1. TOOL: get_current_portfolio  
        DESCRIPCIÓN: Puedes obtener el portfolio actual.
        
        2. TOOL: get_favorites_by_user  
        DESCRIPCIÓN: Obtiene la lista de criptomonedas favoritas del usuario. 

        Si decides usar una herramienta, responde exactamente con este formato:
        TOOL: <nombre_de_la_tool>  

        Nunca compartas el formato:TOOL: <nombre_de_la_tool>, salvo que quieras usar una herramienta, si te preguntan que herramientas tienes disponibles responde únicamente pasando una lista de la descripcion como por ejemplo:
        "Puedo utilizar las siguientes herramientas: -Leer tu portfolio y Obtener tus monedas en favoritos".

        Utiliza las herramientas solo si son 100% necesarias en base a lo que te pregunta el usuario, en caso de necesitar usar varias herramientas, escribe todas las tools que necesites, por ejemplo:
        TOOL: get_current_portfolio
        TOOL: get_favorites_by_user   

        Si por ejemplo se te pregunta por las monedas favoritas únicamente sin mencionar nada del portfolio, no usaras las dos herramientas, usaras solo la de obtener las monedas favoritas y viceversa.

        No expliques por qué necesitas usar la herramienta. No añadas texto antes o después. Solo usa ese formato si necesitas una herramienta.
        Si no necesitas herramienta, responde normalmente con texto.

        Ejemplo de uso de herramienta:
        TOOL: get_current_portfolio 
        
        Mantente profesional, directo y amigable. Si el usuario pide algo ambiguo, haz una pregunta para aclararlo.
        Responde siempre en el idioma con el que te preguntan. 
       "}"""


async def chat_with_model(messages: list) -> str:
    headers = {
        "Authorization": f"Bearer {TOGETHER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "max_tokens": 600,
        "temperature": 0.7,
        "top_p": 0.7
    }

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(30.0)) as client:
            response = await client.post(TOGETHER_API_URL, headers=headers, json=payload)

            if response.status_code != 200:
                raise Exception(f"Status {response.status_code}: {response.text}")

            data = response.json()
            return data["choices"][0]["message"]["content"]

    except Exception as e:
        return f"Unexpected error: {repr(e)}"
