import {prismaClient} from "../src/application/database.js";
import bcrypt from "bcrypt";

export const removeTestUser = async () => {
    await prismaClient.user.deleteMany({
        where: {
            username: "test"
        }
    })
}

export const createTestUser = async () => {
    await prismaClient.user.create({
        data: {
            username: "test",
            password: await bcrypt.hash("Rahasia", 10),
            name: "test",
            token: "test"
        }
    })
};

export const getTestUser = async () => {
    return prismaClient.user.findUnique({
        where: {
            username: 'test'
        }
    })
};

export const removeAllTestContacts = async () => {
    await prismaClient.contact.deleteMany({
        where: {
            username: 'test'
        }
    });
};

export const createTestContact = async () => {
    await prismaClient.contact.create({
        data: {
            username: 'test',
            first_name: 'test',
            last_name: 'test',
            email: 'masumrpg@gmail.com',
            phone: '087729647721'
        }
    });
};

export const getTestContact = async () => {
    return prismaClient.contact.findFirst({
        where: {
            username: 'test'
        }
    });
};