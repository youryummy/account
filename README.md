# Microservicio Accounts

[![Coverage Status](https://coveralls.io/repos/github/youryummy/account/badge.svg?branch=main)](https://coveralls.io/github/youryummy/account?branch=main)

Variables de entorno requeridas:
* PORT: ExpressJS application port (default: 8080)
* MONGO_PROTO: Mongo database protocol (default: mongodb)
* MONGO_HOST: Mongo database host (default: localhost)
* MONGO_PORT: Mongo database port (default: 27017)
* MONGO_DBNAME: Mongo database name (default: default-db)
* MONGO_USER: Mongo database user
* MONGO_PWD: Mongo database password
* FIREBASE_BUCKET: Bucket where files are stored in firebase
* FIREBASE_CREDENTIALS: Base64 encoded service account credentials for firebase.
* JWT_SECRET: Secret for token encoding
* JWT_ISSUER: Token issuer
* COOKIE_DOMAIN: Hosts to where the cookie will be sent

## 1. Nivel de acabado.
Nos presentamos al nivel de acabado 10.

## 2. Una descripción de la aplicación
El microsevicio de cuentas, o Accounts cumple con dos tareas fundamentales dentro de la aplicación: Gestión de cuentas y gestión de credenciales.
* **Gestión de cuentas**: Consiste en un CRUD para gestionar las cuentas que se almacenan en la base de datos del microservicio. Estas operaciones requieren que el usuario se encuentre autenticado.
* **Gestión de credenciales**: Consta de la operación de Login y Register, que son las encargadas de comprobar las credenciales del usuario para firmar el token JWT y registrar nuevas cuentas de usuario, respectivamente.

## 3. La descomposición en microservicios indicando cuál es el implementado por la pareja.
La pareja Mariano Manuel Torrado Sánchez y Alejandro Santisteban Corchos han realizado los microservicios de Ingredients, Account y Gateway.

## 4. El customer agreement de la aplicación.
Se encuentra en la entrega del proyecto.

## 5. El análisis de la capacidad y la justificación de la determinación del coste de cada plan en base a este (para nivel hasta 7 puntos en adelante)
Se encuentra en la entrega del proyecto.

## 6. Una descripción del API REST del microservicio.

* POST /api/v1/login: Operación para el inicio de sesión. Este endpoint recibe en el cuerpo de la petición un JSON con dos atributos: usuario y contraseña. El servidor recibe estos datos y busca el usuario, si lo encuentra, encripta la contraseña con un cifrado unidireccional y comprueba que coincide con la que se encuentra almacenada en la base de datos NoSQL. Si las credenciales son correctas, genera un token JWT y lo envía en la cabecera Set-Cookie. 

* POST /api/v1/register: Esta operación es la responsable de crear las cuentas y almacenarlas las credenciales junto a la información del usuario en la base de datos. A diferencia del resto de operaciones de YourYummy, esta operación recibe peticiones multipart en lugar de JSON, pues las imágenes se envían utilizando este Content-Type. Si la operación es correcta, almacena los datos en la base de datos NoSQL y la imagen en Firebase.  Cabe destacar además que esta operación crea un nuevo libro de recetas al usuario llamado My recipes. 

* GET /api/v1/accounts: Operación para obtener todas las cuentas registradas en la aplicación. Esta operación consulta la base de datos y devuelve todas las cuentas registradas. Al tratarse de una operación que consulta datos de todos los usuarios, su uso está restringido para los usuarios, de manera que solamente el administrador podrá realizar llamadas a este endpoint. 

* GET /api/v1/accounts/{username}: Operación de búsqueda de usuarios. Dado un nombre de usuario, devuelve la información de este. 

* PUT /api/v1/accounts/{username}: Esta operación permite a un usuario modificar su perfil (otros usuarios no pueden modificar el perfil de un usuario ajeno). Al igual que la operación de registro, utiliza multipart, pues uno de los campos modificables es la imagen del usuario. Cabe destacar que el nombre de usuario es fijo y no puede cambiarse, pues actúa como identificador del usuario dentro de la aplicación. 

* DELETE /api/v1/accounts/{username}: Esta operación permite a un usuario borrar su perfil (otros usuarios no pueden borrar perfiles ajenos). Esto provocará que el servidor reescriba la cabecera Set-Cookie para cerrar la sesión del usuario una vez borrado. Sin embargo, información como valoraciones y recetas creadas por el usuario aún permanecerán en la aplicación. Sí se eliminarán los libros de recetas, eventos, suscripción a los distintos planes y sincronización con Google Calendar. 

## 7. Por cada uno de los requisitos del microservicio, una justificación decómo se ha ido consiguiendo. En donde aplique, la justificación debe incluir detalles sobre el sitio del código donde se puede encontrar evidencias de esa implementación.
Se encuentra en la entrega del proyecto.

## 8. Análisis de los esfuerzos (en horas) dedicadas por cada uno. Para esto se recomienda utilizar una herramienta de time tracking como Clockify o Toggl.
Se encuentra en la entrega del proyecto.
