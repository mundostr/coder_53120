import jwt from 'jsonwebtoken';
import { Resend } from 'resend';

import config from '../config.js';
import usersModel from "../models/Users.js";
import { createHash, passwordValidation, createToken } from "../utils.js";

const registerUser = async(req,res) =>{
    const {first_name,last_name,email,password} = req.body;
    console.log(`Registering ${first_name} ${last_name} email: ${email} and pwd: ${password}`)
    if(!first_name||!last_name||!email||!password) return res.status(400).send({status:"error",error:"Incomplete values"})
    const exists = await usersModel.findOne({email});
    if(exists) return res.status(400).send({status:"error",error:"User already exists"});
    const hashedPassword = await createHash(password);
    const user = {
        first_name,
        last_name,
        email,
        password: hashedPassword
    }
    await usersModel.create(user);
    res.send({status:"success",message:"Registered"})
}

const loginUser = async(req,res) =>{
    const {email,password} = req.body;
    if(!email||!password) return res.status(400).send({status:"error",error:"Incomplete vlaues"});
    const user = await usersModel.findOne({email});
    if(!user) return res.status(404).send({status:"error",error:"User not found"});
    const isValidPassword = await passwordValidation(user,password);
    if(!isValidPassword) return res.status(400).send({status:"error",error:"Incorrect password"});
    console.log(`El ingreso de ${email} fue satisfactorio`)
    res.send({status:"success",message:"logged in"})
}

const restoreRequest = async (req, res) => {
    /**
     * Generar cuenta gratuita en resend.com y generar una nueva
     * API Key para identificarse
     */
    const resend = new Resend(config.RESEND_API_KEY);
    
    /**
     * Recuperamos email y nueva clave solicitada vía query
     * 
     * Idealmente la clave no debería solicitarse en esta etapa,
     * sino más adelante, pero como no tenemos activo un sistema
     * de plantillas para pedirla, lo hacemos todo junto.
     */
    const email = req.query.email;
    const newPass = req.query.pass;
    if (email !== undefined && email !== '' && newPass !== undefined && newPass !== '') {
        // Verificamos que se encuentre registrado (hacer aquí)

        // Generamos token de corta duración
        const token = createToken({ email: email, pass: newPass }, '5m'); // Válido solo por 5 mins

        // Enviamos mail a la cuenta indicada con enlace de restablecimiento
        const { data, error } = await resend.emails.send({
            /**
             * Para utilizar un email propio en el from, es necesario
             * verificar el dominio (ej: carlos@perren.com)
             * 
             * En el servicio que maneja los DNS de perren.com,se debe
             * incorporar un nuevo registro, ver más info en docs de resend.com
             * 
             * No obstante para este caso no nos interesa porque el objetivo
             * no es que el cliente responda al email, simplemente que le llegue
             * para tener acceso a la url de restablecimiento
             */
            from: `${config.APP_NAME} <onboarding@resend.dev>`,
            to: [email],
            subject: `${config.APP_NAME} - Restablecimiento de contraseña de cuenta`,
            html: `
                <h1>${config.APP_NAME}</h1>
                <h2>Restablecimiento de contraseña de cuenta</h2>
                <p><b>Atención!</b>: si usted NO ha solicitado este mail, simplemente ignórelo</p>
                <p>Para generar una nueva clave en su cuenta, ingrese por favor al siguiente enlace:</p>
                <p><a href="http://localhost:5000/api/sessions/restoreconfirm?access_token=${token}">http://localhost:5000/api/sessions/restoreconfirm?access_token=${token}</a></p>
            `,
        });
    
        if (error) return res.status(403).send({status:"error",error:error});
        res.status(200).send({status:"success",message:`Se ha enviado un mail a ${email} con instrucciones para restablecer la contraseña`});
    } else {
        res.status(400).send({status:"error",error:'Se requieren email y pass vía query'});
    }
}

const restoreConfirm = async (req, res) => {
    const hash = await createHash(req.user.pass);
    // Obviamente llamar acá al método para actualizar el hash en la cuenta correspondiente
    res.status(200).send({status:"success",message: `Se ha actualizado la clave (cuenta: ${req.user.email}, pass: ${hash}). Esto es solo ilustrativo, por supuesto no aparecería el hash en el mensaje definitivo.`});
}

export default {
    loginUser,
    registerUser,
    restoreRequest,
    restoreConfirm
}
