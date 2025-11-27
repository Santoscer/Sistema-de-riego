from fastapi import APIRouter, HTTPException
from app.models.usuario import Usuario, UsuarioUpdate
from app.repositories.usuarios_repo import UsuariosRepository

router = APIRouter(prefix="/api", tags=["usuarios"])
repo = UsuariosRepository()

@router.post("/registro", response_model=Usuario)
def registrar_usuario(usuario: Usuario):
    try:
        return repo.crear_usuario(usuario)
    except ValueError:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

@router.get("/usuarios", response_model=list[Usuario])
def listar_usuarios():
    return repo.listar_usuarios()

@router.put("/usuarios/{usuario_id}", response_model=Usuario)
def reemplazar_usuario(usuario_id: str, usuario: Usuario):
    try:
        return repo.reemplazar_usuario(usuario_id, usuario)
    except LookupError:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

@router.patch("/usuarios/{usuario_id}", response_model=Usuario)
def actualizar_parcial(usuario_id: str, cambios: UsuarioUpdate):
    try:
        return repo.actualizar_parcial(usuario_id, cambios)
    except LookupError:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

@router.delete("/usuarios/{usuario_id}")
def eliminar_usuario(usuario_id: str):
    try:
        repo.eliminar_usuario(usuario_id)
        return {"mensaje": "Usuario eliminado correctamente"}
    except LookupError:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
