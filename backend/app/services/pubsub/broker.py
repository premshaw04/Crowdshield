from abc import ABC, abstractmethod
from typing import Callable, Awaitable, Dict, List

class MessageBroker(ABC):
    @abstractmethod
    async def publish(self, channel: str, message: dict):
        pass

    @abstractmethod
    async def subscribe(self, channel: str, callback: Callable[[dict], Awaitable[None]]):
        pass

    @abstractmethod
    async def unsubscribe(self, channel: str, callback: Callable[[dict], Awaitable[None]]):
        pass

class InMemoryBroker(MessageBroker):
    def __init__(self):
        self.subscribers: Dict[str, List[Callable[[dict], Awaitable[None]]]] = {}
        self.main_loop = None

    def set_main_loop(self, loop):
        self.main_loop = loop

    async def publish(self, channel: str, message: dict):
        if channel in self.subscribers:
            for callback in self.subscribers[channel]:
                await callback(message)

    def publish_from_thread(self, channel: str, message: dict):
        import asyncio
        if self.main_loop and self.main_loop.is_running():
            asyncio.run_coroutine_threadsafe(self.publish(channel, message), self.main_loop)
        else:
            # Fallback if no loop is configured (e.g. testing)
            asyncio.run(self.publish(channel, message))

    async def subscribe(self, channel: str, callback: Callable[[dict], Awaitable[None]]):
        if channel not in self.subscribers:
            self.subscribers[channel] = []
        self.subscribers[channel].append(callback)

    async def unsubscribe(self, channel: str, callback: Callable[[dict], Awaitable[None]]):
        if channel in self.subscribers:
            if callback in self.subscribers[channel]:
                self.subscribers[channel].remove(callback)
            if not self.subscribers[channel]:
                del self.subscribers[channel]

broker = InMemoryBroker()
