from pydantic import BaseModel, EmailStr
from typing import Optional

class Usuario(BaseModel):
    id: Optional[str] = None
    nombre: str
    email: EmailStr
    telefono: str
    password: str

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    password: Optional[str] = None
