from __future__ import annotations

from typing import Dict

from agents import Agent, RunContextWrapper, function_tool
from chatkit.agents import AgentContext

from .airline_state import AirlineStateManager

SUPPORT_AGENT_INSTRUCTIONS = """
You are a friendly and efficient airline customer support agent for OpenSkies.
You help elite flyers with seat changes, cancellations, checked bags, and
special requests. Follow these guidelines:

- Always acknowledge the customer's loyalty status and recent travel plans.
- When a task requires action, call the appropriate tool instead of describing
  the change hypothetically.
- After using a tool, confirm the outcome and offer next steps.
- If you cannot fulfill a request, apologise and suggest an alternative.
- Keep responses concise (2-3 sentences) unless extra detail is required.

Available tools:
- change_seat(flight_number: str, seat: str) – move the passenger to a new seat.
- cancel_trip() – cancel the upcoming reservation and note the refund.
- add_checked_bag() – add one checked bag to the itinerary.
- set_meal_preference(meal: str) – update meal preference (e.g. vegetarian).
- request_assistance(note: str) – record a special assistance request.

Only use information provided in the customer context or tool results. Do not
invent confirmation numbers or policy details.
""".strip()


def build_support_agent(state_manager: AirlineStateManager) -> Agent[AgentContext]:
    """Create the airline customer support agent with task-specific tools."""

    def _thread_id(ctx: RunContextWrapper[AgentContext]) -> str:
        return ctx.context.thread.id

    @function_tool(
        description_override="Move the passenger to a different seat on a flight.",
    )
    async def change_seat(
        ctx: RunContextWrapper[AgentContext],
        flight_number: str,
        seat: str,
    ) -> Dict[str, str]:
        try:
            message = state_manager.change_seat(_thread_id(ctx), flight_number, seat)
        except ValueError as exc:  # translate user errors
            raise ValueError(str(exc)) from exc
        return {"result": message}

    @function_tool(
        description_override="Cancel the traveller's upcoming trip and note the refund.",
    )
    async def cancel_trip(ctx: RunContextWrapper[AgentContext]) -> Dict[str, str]:
        message = state_manager.cancel_trip(_thread_id(ctx))
        return {"result": message}

    @function_tool(
        description_override="Add a checked bag to the reservation.",
    )
    async def add_checked_bag(
        ctx: RunContextWrapper[AgentContext],
    ) -> Dict[str, str | int]:
        message = state_manager.add_bag(_thread_id(ctx))
        profile = state_manager.get_profile(_thread_id(ctx))
        return {"result": message, "bags_checked": profile.bags_checked}

    @function_tool(
        description_override="Record or update the passenger's meal preference.",
    )
    async def set_meal_preference(
        ctx: RunContextWrapper[AgentContext],
        meal: str,
    ) -> Dict[str, str]:
        message = state_manager.set_meal(_thread_id(ctx), meal)
        return {"result": message}

    @function_tool(
        description_override="Note a special assistance request for airport staff.",
    )
    async def request_assistance(
        ctx: RunContextWrapper[AgentContext],
        note: str,
    ) -> Dict[str, str]:
        message = state_manager.request_assistance(_thread_id(ctx), note)
        return {"result": message}

    tools = [
        change_seat,
        cancel_trip,
        add_checked_bag,
        set_meal_preference,
        request_assistance,
    ]

    return Agent[AgentContext](
        model="gpt-4.1-mini",
        name="OpenSkies Concierge",
        instructions=SUPPORT_AGENT_INSTRUCTIONS,
        tools=tools,  # type: ignore[arg-type]
    )


state_manager = AirlineStateManager()
support_agent = build_support_agent(state_manager)
