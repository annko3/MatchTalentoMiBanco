import { auth, db } from '../assets/firebase/config';
import { collection, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export async function crearPostulacion(idVacante) {
    const user = auth.currentUser;
    if (!user) {
        alert("Debes iniciar sesión para postular.");
        return;
    }

    const nuevaPostulacion = {
        idVacante: idVacante,
        idPostulante: user.uid,
        fechaPostulacion: Timestamp.now(),
        estado: "Pendiente",
        matchScores: {
            total: 0, // La IA lo llenará luego
            justificacionIA: "Procesando...",
            puntuacion: { inicial: 0 }
        }
    };

    try {
        await addDoc(collection(db, "postulaciones"), nuevaPostulacion);
        alert("¡Tu postulación ha sido enviada con éxito!");
    } catch (error) {
        console.error(error);
    }
}