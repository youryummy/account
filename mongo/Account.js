import { Schema, model } from "mongoose";

const AccountSchema = new Schema(
    {
        username: {
            type: String,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        fullName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            validate: {
                validator: (value) => (/^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/).test(value),
                message: () => `Invalid email address`
            }
        },
        cellPhone: {
            type: String,
            validate: {
                validator: (value) => (/^[+]?[(]?[0-9]{0,3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im).test(value),
                message: () => `Invalid phone number`
            }
        },
        birthDate: {
            type: Date,
            validate: {
                validator: (value) => !isNaN(new Date(value).getTime()) && new Date(value) < new Date(),
                message: () => `Invalid birth date. Must input a valid Date prior to the current date.`
            }
        },
        avatar: {
            type: String
        },
        role: {
            type: String,
            required: true,
            enum: ['user', 'admin']
        },
        plan: {
            type: String,
            required: true,
            enum: ['base', 'premium']
        }
    }
)

export default model('Account', AccountSchema, 'account');
