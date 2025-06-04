from Backend.AgenteIA.chatbot_service import chat_with_model, prompt
from Backend.Services import favorite_service, portfolio_service
from sqlalchemy.orm import Session
from Backend.Models.user import User
import re
from decimal import Decimal


# Prompt de sistema para el agente
system_prompt = {
    "role": "system",
    "content": prompt
}

import re
from decimal import Decimal

import re
from decimal import Decimal

async def process_user_input(user_input: str, db: Session, current_user: User):
    messages = [system_prompt, {"role": "user", "content": user_input}]

    while True:
        response = await chat_with_model(messages)

        # Limpiar bloques <think> si existen
        response = re.sub(r"<think>.*?</think>", "", response, flags=re.DOTALL).strip()
        messages.append({"role": "assistant", "content": response})

        # Buscar TOOL e INPUT
        tool_match = re.search(r"TOOL:\s*(\w+)", response)
        input_match = re.search(r"INPUT:\s*(.+)", response)

        if not tool_match:
            # No hay más herramientas, devolvemos la última respuesta del modelo
            return response

        tool_name = tool_match.group(1)
        input_data = input_match.group(1).strip() if input_match else ""

        print(f"Ejecutando herramienta: {tool_name} con input: {input_data}")

        # Procesar la herramienta
        match tool_name:
            case "get_current_portfolio":
                portfolio = portfolio_service.list_user_portfolios(db, current_user.id)
                lines = []
                for entry in portfolio:
                    coin = entry.coin_id
                    invested = Decimal(entry.investment)
                    price = Decimal(entry.purchase_price)
                    qty = (invested / price).quantize(Decimal("0.000001"))
                    lines.append(
                        f"- {coin}: invertido €{invested:.2f} cuando la criptomoneda valía €{price:.2f} "
                        f"(cantidad: {qty} {coin.upper()})"
                    )
                mcp_result_str = "Portafolio actual:\n" + "\n".join(lines)

            case "get_favorites_by_user":
                favoritos = favorite_service.get_favorites_by_user(db, user_id=current_user.id)
                mcp_result = [fav.coin_id for fav in favoritos]
                mcp_result_str = f"Favoritos: {', '.join(mcp_result)}"

            case _:
                mcp_result_str = f"Resultado simulado para {tool_name} con input {input_data}"

        # Añadir el resultado al historial y pedir respuesta final (o más herramientas)
        messages.append({"role": "user", "content": f"El resultado fue: {mcp_result_str}. Devuelve una respuesta final o pide otra herramienta si lo necesitas."})



