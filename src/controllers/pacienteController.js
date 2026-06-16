const db = require('../config/db');
const esClient = require('../config/elasticsearch');

const INDEX = 'paciente'; // Verifica el nombre real

const createPaciente = async (req, res) => {
    const {
        id_paciente,
        curp_ssn,
        nombre,
        apellido,
        fecha_nac,
        genero,
        ciudad_residencia,
        id_nodo_orig
    } = req.body;

    try {

        // Guardar en MySQL
        await db.query(
            `INSERT INTO PACIENTE
            (id_paciente, curp_ssn, nombre, apellido,
             fecha_nac, genero, ciudad_residencia, id_nodo_orig)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id_paciente,
                curp_ssn,
                nombre,
                apellido,
                fecha_nac,
                genero,
                ciudad_residencia,
                id_nodo_orig
            ]
        );

        // Guardar en Elasticsearch
        await esClient.index({
            index: INDEX,
            id: id_paciente.toString(),
            document: {
                id_paciente,
                curp_ssn,
                nombre,
                apellido,
                fecha_nac,
                genero,
                ciudad_residencia,
                id_nodo_orig
            }
        });

        res.status(201).json({
            success:true,
            message:'Paciente registrado correctamente'
        });

    } catch(error){

        console.error(
            'Error creando paciente:',
            error
        );

        res.status(500).json({
            success:false,
            message:'Error al registrar paciente'
        });
    }
};

const updatePaciente = async (req,res)=>{

    const { id } = req.params;
    const datos = req.body;

    try{

        await db.query(
            `UPDATE PACIENTE
            SET nombre=?,
                apellido=?,
                ciudad_residencia=?
            WHERE id_paciente=?`,
            [
                datos.nombre,
                datos.apellido,
                datos.ciudad_residencia,
                id
            ]
        );

        await esClient.update({
            index: INDEX,
            id: id.toString(),
            doc: datos
        });

        res.json({
            success:true,
            message:'Paciente actualizado'
        });

    }catch(error){

        console.error(error);

        res.status(500).json({
            success:false,
            message:'Error al actualizar'
        });
    }
};

const deletePaciente = async(req,res)=>{

    const { id } = req.params;

    try{

        await db.query(
            `DELETE FROM PACIENTE
             WHERE id_paciente=?`,
             [id]
        );

        try{

            await esClient.delete({
                index: INDEX,
                id: id.toString()
            });

        }catch(esError){

            // Ignorar si no existe
            if(
                esError.meta?.statusCode !== 404
            ){
                throw esError;
            }
        }

        res.json({
            success:true,
            message:'Paciente eliminado'
        });

    }catch(error){

        console.error(error);

        res.status(500).json({
            success:false,
            message:'Error eliminando paciente'
        });
    }
};

module.exports = {
    getPacientes,
    getPacienteById,
    createPaciente,
    updatePaciente,
    deletePaciente
};
