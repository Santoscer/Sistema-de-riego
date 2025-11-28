from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.staticfiles import StaticFiles
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
    telefono: int
    password: str

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[int] = None
    password: Optional[str] = None

# ==== BASE DE DATOS EN MEMORIA ====
usuarios_db: list[Usuario] = []


# ===========================
#   MANEJO DE EXCEPCIONES
# ===========================
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    if 400 <= exc.status_code < 500:
        tipo = "Error del cliente (4XX)"
        descripcion = "La solicitud enviada por el cliente contiene errores o no puede ser procesada."
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
#       FUNCIONES AUXILIARES
# ================================
def get_usuario(usuario_id: str) -> Usuario:
    usuario = next((u for u in usuarios_db if u.id == usuario_id), None)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return usuario

def validar_email_unico(email: str, excluir_id: Optional[str] = None):
    if any(u.email == email and u.id != excluir_id for u in usuarios_db):
        raise HTTPException(status_code=400, detail="Email ya registrado.")

def validar_usuario_logueado(user_logged_id: str):
    usuario = next((u for u in usuarios_db if u.id == user_logged_id), None)
    if not usuario:
        raise HTTPException(
            status_code=401,
            detail="Usuario no autenticado o sesión inválida."
        )
    return usuario


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
#   🔥🔥 POST → Login de usuario (AGREGADO)
# ================================
@app.post("/api/login")
def login_usuario(datos: dict):
    email = datos.get("email")
    password = datos.get("password")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email y contraseña son obligatorios.")

    usuario = next(
        (u for u in usuarios_db if u.email == email and u.password == password),
        None
    )

    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas.")

    return {
        "mensaje": "Inicio de sesión exitoso.",
        "id": usuario.id,
        "nombre": usuario.nombre,
        "email": usuario.email
    }


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
    return get_usuario(usuario_id)

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
def eliminar_usuario(
    usuario_id: str,
    x_user_id: str = Header(..., alias="X-User-Id")
):
    validar_usuario_logueado(x_user_id)

    usuario = get_usuario(usuario_id)

    if usuario_id == x_user_id:
        raise HTTPException(
            status_code=403,
            detail="No puedes eliminar tu propio usuario. Operación denegada."
        )

    usuarios_db.remove(usuario)

    return {
        "mensaje": f"Usuario con ID {usuario_id} eliminado correctamente.",
        "usuario_eliminado": usuario.nombre
    }


# ==================================================
#     SERVIR LA PÁGINA WEB GREENCHECK (FRONTEND)
# ==================================================
app.mount(
    "/",
    StaticFiles(directory="Pagina", html=True),
    name="Pagina"
)
