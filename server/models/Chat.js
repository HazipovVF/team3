'use strict';

const mongoose = require('mongoose');
const cloudinary = require('cloudinary');
const Message = require('./Message');
const createIdenticon = require('../utils/identicon');

const mongoSchema = new mongoose.Schema({
    title: String,
    type: String,
    members: [{ type: String, ref: 'User' }],
    messages: [Message.schema],
    avatar: String
});

class ChatClass {
    static async findOrCreate({ title, members, type }) {
        if (type === 'private') {
            const chat = await this.findOne({ members });

            if (chat) {
                return chat;
            }
        }

        return await this.create({ title, members, type });
    }

    static setChatInfo(userNickname, chat) {
        if (chat.type === 'group') {
            return chat;
        }

        let interlocutor = chat.members.find(
            member => member.nickname !== userNickname
        );

        if (!interlocutor) {
            [interlocutor] = chat.members;
        }

        chat.avatar = interlocutor.avatar;
        chat.title = interlocutor.nickname;

        return chat;
    }

    static isValid({ members, type }) {
        if (!members) {
            return false;
        }

        /* eslint-disable no-mixed-operators */
        return (type === 'private') && (members.length === 2) ||
               (type === 'group') && (members.length !== 0);
    }
}

/* eslint-disable no-invalid-this */
mongoSchema.pre('save', async function () {
    if (this.type !== 'group') {
        return this;
    }

    const avatarInBase64 = createIdenticon();
    const response = await cloudinary.v2.uploader.upload(`data:image/png;base64,${avatarInBase64}`);

    this.avatar = response.url;

    return this;
});

mongoSchema.loadClass(ChatClass);
const Chat = mongoose.model('Chat', mongoSchema);

module.exports = Chat;
