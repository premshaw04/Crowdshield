from abc import ABC, abstractmethod

class StorageProvider(ABC):
    @abstractmethod
    def save_file(self, file_content: bytes, file_name: str) -> str:
        """Saves a file and returns the storage key or path"""
        pass

    @abstractmethod
    def delete_file(self, file_key: str) -> bool:
        """Deletes a file by its key"""
        pass

    @abstractmethod
    def get_url(self, file_key: str) -> str:
        """Returns the public URL for the file"""
        pass
