#include <iostream>
using namespace std;

struct Medicion {
    string fecha;
    int humedad;
    Medicion* sig;
};

struct Ubicacion {
    string nombre;
    Medicion* listaMediciones;
    Ubicacion* sig;
};


Ubicacion* crearUbicacion(string nombre) {
    Ubicacion* nueva = new Ubicacion {nombre};
    nueva->listaMediciones = NULL;
    nueva->sig = NULL;
    return nueva; 
}

Medicion* crearMedicion(string fecha, int humedad) {
    Medicion* nueva = new Medicion {fecha, humedad};
    nueva->sig = NULL;
    return nueva;
}

void agregarMedicion(Ubicacion* ubic, string fecha, int humedad) {
    Medicion* nueva = crearMedicion(fecha, humedad);
    if (ubic->listaMediciones == NULL) {
        ubic->listaMediciones = nueva;
    } else {
        Medicion* aux = ubic->listaMediciones;
        while (aux->sig != NULL) {
            aux = aux->sig;
        }
        aux->sig = nueva;
    }
}


string siguienteFecha(string fecha, int dias) {
    int dia, mes, anio;
    char barra;
    dia = (fecha[0] - '0') * 10 + (fecha[1] - '0');
    mes = (fecha[3] - '0') * 10 + (fecha[4] - '0');
    anio = (fecha[6] - '0') * 1000 + (fecha[7] - '0') * 100 + (fecha[8] - '0') * 10 + (fecha[9] - '0');
    dia = dia + dias;
    if (dia > 30) dia = dia - 30; 
    string nueva = "";
    if (dia < 10) nueva += "0";
    nueva += to_string(dia) + "/";
    if (mes < 10) nueva += "0";
    nueva += to_string(mes) + "/";
    nueva += to_string(anio);
    return nueva;
}


void mostrarDatos(Ubicacion* lista) {
    Ubicacion* auxU = lista;
    while (auxU != NULL) {
        cout << "\nUbicacion: " << auxU->nombre << endl;
        Medicion* auxM = auxU->listaMediciones;
        while (auxM != NULL) {
            cout << "  Fecha: " << auxM->fecha << "  Humedad: " << auxM->humedad << "%" << endl;
            auxM = auxM->sig;
        }
        auxU = auxU->sig;
    }
}


void ubicacionMasSeca(Ubicacion* lista) {
    Ubicacion* auxU = lista;
    string masSeca = "";
    float menorProm;

    while (auxU != NULL) {
        int suma = 0, cont = 0;
        Medicion* auxM = auxU->listaMediciones;
        while (auxM != NULL) {
            suma += auxM->humedad;
            cont++;
            auxM = auxM->sig;
        }
        float prom = (float)suma / cont;
        cout << "Promedio de " << auxU->nombre << ": " << prom << "%" << endl;
        if (prom < menorProm) {
            menorProm = prom;
            masSeca = auxU->nombre;
        }
        auxU = auxU->sig;
    }

    cout << "\nLa ubicacion mas seca es: " << masSeca << " (" << menorProm << "%)\n";
}


void diaMasSeco(Ubicacion* lista) {
    int menor;
    Ubicacion* auxU = lista;


    while (auxU != NULL) {
        Medicion* auxM = auxU->listaMediciones;
        while (auxM != NULL) {
            if (auxM->humedad < menor) menor = auxM->humedad;
            auxM = auxM->sig;
        }
        auxU = auxU->sig;
    }

    cout << "\nDias mas secos (humedad " << menor << "%):\n";
    auxU = lista;
    while (auxU != NULL) {
        Medicion* auxM = auxU->listaMediciones;
        while (auxM != NULL) {
            if (auxM->humedad == menor) {
                cout << auxM->fecha << " en " << auxU->nombre << endl;
            }
            auxM = auxM->sig;
        }
        auxU = auxU->sig;
    }
}


void editarHumedad(Ubicacion* lista, string ubic, string fecha, int nuevaHum) {
    Ubicacion* auxU = lista;
    while (auxU != NULL) {
        if (auxU->nombre == ubic) {
            Medicion* auxM = auxU->listaMediciones;
            while (auxM != NULL) {
                if (auxM->fecha == fecha) {
                    auxM->humedad = nuevaHum;
                    cout << "Humedad actualizada\n";
                    return;
                }
                auxM = auxM->sig;
            }
        }
        auxU = auxU->sig;
    }
    cout << "No se encontro la ubicacion o fecha\n";
}



int main() {
    Ubicacion* lista = NULL;
    int nUbic;
    cout << "Cuantas ubicaciones desea registrar ";
    cin >> nUbic;

    for (int i = 0; i < nUbic; i++) {
        string nombre, fecha;
        int nMedidas;
        cout << "\nNombre de la ubicacion: ";
        cin.ignore();
        getline(cin, nombre);
        Ubicacion* nueva = crearUbicacion(nombre);
        nueva->sig = lista;
        lista = nueva;

        cout << "Fecha de inicio (dd/mm/aaaa): ";
        getline(cin, fecha);
        cout << "Cantidad de medidas: ";
        cin >> nMedidas;

        for (int j = 0; j < nMedidas; j++) {
            int hum = (j * 37 + i * 11) % 100;
            string fechaNueva = siguienteFecha(fecha, j);
            agregarMedicion(nueva, fechaNueva, hum);
        }
    }

    int op;
    do {
        cout << "\n--- MENU ---\n";
        cout << "1. Mostrar datos\n";
        cout << "2. Ubicacion mas seca\n";
        cout << "3. Dia mas seco\n";
        cout << "4. Editar humedad\n";
        cout << "Opcion: ";
        cin >> op;

        if (op == 1) mostrarDatos(lista);
        else if (op == 2) ubicacionMasSeca(lista);
        else if (op == 3) diaMasSeco(lista);
        else if (op == 4) {
            string u, f;
            int h;
            cin.ignore();
            cout << "Ubicacion: ";
            getline(cin, u);
            cout << "Fecha: ";
            getline(cin, f);
            cout << "Nueva humedad: ";
            cin >> h;
            editarHumedad(lista, u, f, h);
        }
    } while (op != 4);

    cout << "\nFin del programa\n";
    
    return 0;
}
