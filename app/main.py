from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.staticfiles import StaticFiles  # <<< NUEVO
from pydantic import BaseModel
from typing import Optional
from uuid import uuid4

app = FastAPI()

# ==== CORS ====
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==== MODELOS ====
class Usuario(BaseModel):
    id: Optional[str] = None
    nombre: str
    email: str
    telefono: str
    password: str

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    password: Optional[str] = None

# ==== BASE DE DATOS EN MEMORIA ====
usuarios_db: list[Usuario] = []

# ===========================
#   MANEJO DE EXCEPCIONES
# ===========================

# 1) Errores controlados (4XX)
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):

    # Clasificación
    if 400 <= exc.status_code < 500:
        tipo = "Error del cliente (4XX)"
        descripcion = (
            "La solicitud enviada por el cliente contiene errores o no puede ser procesada."
        )
    elif 300 <= exc.status_code < 400:
        tipo = "Redirección (3XX)"
        descripcion = "La solicitud requiere una acción adicional."
    elif 200 <= exc.status_code < 300:
        tipo = "Éxito (2XX)"
        descripcion = "La solicitud fue procesada correctamente."
    else:
        tipo = "Código HTTP"
        descripcion = "Estado no clasificado."

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "estado": tipo,
            "mensaje": exc.detail,
            "descripcion": descripcion,
            "ruta": str(request.url),
        },
    )

# 2) Error de validación (422)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "estado": "Error del cliente (4XX)",
            "mensaje": "Los datos enviados no cumplen el formato esperado.",
            "descripcion": "Hay errores en los campos enviados.",
            "detalles": exc.errors(),
        },
    )

# 3) Error interno (5XX)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "estado": "Error del servidor (5XX)",
            "mensaje": "Ocurrió un error inesperado dentro del servidor.",
            "descripcion": "Error interno al procesar la solicitud.",
            "detalle": str(exc),
        },
    )

# ================================
#       FUNCIÓN AUXILIAR
# ================================
def get_usuario(usuario_id: str) -> Usuario:
    usuario = next((u for u in usuarios_db if u.id == usuario_id), None)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return usuario

def validar_email_unico(email: str, excluir_id: Optional[str] = None):
    if any(u.email == email and u.id != excluir_id for u in usuarios_db):
        raise HTTPException(status_code=400, detail="Email ya registrado.")

# ================================
#   POST → Registrar usuario
# ================================
@app.post("/api/registro")
def registrar_usuario(usuario: Usuario):
    validar_email_unico(usuario.email)
    usuario.id = str(uuid4())
    usuarios_db.append(usuario)
    return {"mensaje": "Usuario registrado correctamente.", "id": usuario.id}

# ================================
#   GET → Listar usuarios
# ================================
@app.get("/api/usuarios")
def obtener_usuarios():
    return JSONResponse(content=[u.dict() for u in usuarios_db])

# ================================
#   GET → Obtener usuario por ID
# ================================
@app.get("/api/usuarios/{usuario_id}")
def obtener_usuario_por_id(usuario_id: str):
    usuario = get_usuario(usuario_id)
    return usuario

# ================================
#   PUT → Reemplazar usuario
# ================================
@app.put("/api/usuarios/{usuario_id}")
def reemplazar_usuario(usuario_id: str, datos: Usuario):
    usuario = get_usuario(usuario_id)

    validar_email_unico(datos.email, excluir_id=usuario_id)

    usuario.nombre = datos.nombre
    usuario.email = datos.email
    usuario.telefono = datos.telefono
    usuario.password = datos.password

    return {"mensaje": f"Usuario con ID {usuario_id} reemplazado correctamente."}

# ================================
#   PATCH → Actualización parcial
# ================================
@app.patch("/api/usuarios/{usuario_id}")
def actualizar_parcial(usuario_id: str, datos: UsuarioUpdate):
    usuario = get_usuario(usuario_id)
    datos_dict = datos.dict(exclude_unset=True)

    if "email" in datos_dict:
        validar_email_unico(datos_dict["email"], excluir_id=usuario_id)

    for key, value in datos_dict.items():
        setattr(usuario, key, value)

    return {"mensaje": f"Usuario con ID {usuario_id} actualizado parcialmente."}

# ================================
#   DELETE → Eliminar usuario
# ================================
@app.delete("/api/usuarios/{usuario_id}")
def eliminar_usuario(usuario_id: str):
    usuario = get_usuario(usuario_id)
    usuarios_db.remove(usuario)
    return {"mensaje": f"Usuario con ID {usuario_id} eliminado correctamente."}


# ==================================================
#     SERVIR LA PÁGINA WEB GREENCHECK (FRONTEND)
# ==================================================
# Esto hace que http://127.0.0.1:8000/ muestre tu index.html
app.mount(
    "/", 
    StaticFiles(directory="Pagina", html=True),
    name="Pagina"
)
