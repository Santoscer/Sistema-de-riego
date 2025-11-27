from typing import List, Optional
from uuid import uuid4
from app.models.usuario import Usuario, UsuarioUpdate

class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class UsuariosRepository(metaclass=Singleton):
    def __init__(self):
        self._usuarios: List[Usuario] = []

    def crear_usuario(self, usuario: Usuario) -> Usuario:
        if any(u.email == usuario.email for u in self._usuarios):
            raise ValueError("EMAIL_DUPLICADO")

        usuario.id = str(uuid4())
        self._usuarios.append(usuario)
        return usuario

    def listar_usuarios(self) -> List[Usuario]:
        return self._usuarios

    def obtener_usuario(self, usuario_id: str) -> Optional[Usuario]:
        return next((u for u in self._usuarios if u.id == usuario_id), None)

    def reemplazar_usuario(self, usuario_id: str, nuevo: Usuario) -> Usuario:
        usuario = self.obtener_usuario(usuario_id)
        if not usuario:
            raise LookupError("NO_ENCONTRADO")

        usuario.nombre = nuevo.nombre
        usuario.email = nuevo.email
        usuario.telefono = nuevo.telefono
        usuario.password = nuevo.password
        return usuario

    def actualizar_parcial(self, usuario_id: str, cambios: UsuarioUpdate) -> Usuario:
        usuario = self.obtener_usuario(usuario_id)
        if not usuario:
            raise LookupError("NO_ENCONTRADO")

        if cambios.nombre is not None:
            usuario.nombre = cambios.nombre
        if cambios.email is not None:
            usuario.email = cambios.email
        if cambios.telefono is not None:
            usuario.telefono = cambios.telefono
        if cambios.password is not None:
            usuario.password = cambios.password

        return usuario

    def eliminar_usuario(self, usuario_id: str) -> None:
        usuario = self.obtener_usuario(usuario_id)
        if not usuario:
            raise LookupError("NO_ENCONTRADO")
        self._usuarios.remove(usuario)
