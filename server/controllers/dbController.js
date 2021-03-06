'use strict';

const cloudinary = require('cloudinary');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

async function getChats(req, res) {
    try {
        if (!req.user || !req.user.nickname) {
            res.sendStatus(401);

            return;
        }

        const chats = await Chat.find({
            members: { $elemMatch: { $regex: `^${req.user.nickname}$`, $options: 'i' } }
        }).populate('members');

        res.status(200).json(chats.map(chat => Chat.setChatInfo(req.user.nickname, chat)));
    } catch (e) {
        res.sendStatus(400);
    }
}

async function getMessages(req, res) {
    try {
        if (!req.user || !req.user.nickname) {
            res.sendStatus(401);

            return;
        }

        const chat = await Chat.findOne({
            _id: req.params.id,
            members: req.user.nickname
        }).select('messages');

        if (chat) {
            res.status(200).json(chat.messages);
        } else {
            res.sendStatus(400);
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
}

async function createMessage(req, res) {
    try {
        if (!req.user || !req.user.nickname) {
            res.sendStatus(401);

            return;
        }

        const message = await Message.initialize({
            author: req.user.nickname,
            text: req.body.text
        });

        const chat = await Chat.findOneAndUpdate(
            { _id: req.params.id, members: req.user.nickname },
            { $push: { messages: message } }
        );

        res.sendStatus(chat === null ? 400 : 200);
    } catch (e) {
        res.sendStatus(500);
    }
}

async function createChat(req, res) {
    try {
        if (!Chat.isValid(req.body)) {
            res.sendStatus(400);

            return;
        }
        const newChat = await Chat.findOrCreate(req.body);

        res.status(200).json(newChat);
    } catch (e) {
        res.status(500).send(e.message);
    }
}

async function getUser(req, res) {
    try {
        const user = await User
            .findOne({ _id: { $regex: `^${req.params.nickname}$`, $options: 'i' } })
            .select('nickname avatar');

        if (!user) {
            res.sendStatus(404);

            return;
        }

        res.status(200).json(user);
    } catch (e) {
        res.sendStatus(404);
    }
}

async function createUser(req, res) {
    try {
        const user = await User.findOrCreate({ nickname: req.params.nickname });

        res.status(200).json(user);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

async function updateUserAvatar(req, res) {
    try {
        const { url } = await _updateImage(`${req.params.nickname}_profile`, req.file.buffer);

        const user = await User.findOneAndUpdate(
            { _id: req.params.nickname },
            { $set: { avatar: url } }
        );

        res.sendStatus(user === null ? 400 : 200);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

async function updateChatAvatar(req, res) {
    try {
        const { url } = await _updateImage(req.params.id, req.file.buffer);

        const user = await Chat.findOneAndUpdate(
            { _id: req.params.id },
            { $set: { avatar: url } }
        );

        res.sendStatus(user === null ? 400 : 200);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

async function _updateImage(publicId, fileBuffer) {
    await cloudinary.v2.uploader.destroy(publicId);

    return await cloudinary.v2.uploader.upload(
        `data:image/png;base64,${fileBuffer.toString('base64')}`,
        { 'public_id': publicId }
    );
}

async function updateChatTitle(req, res) {
    try {
        const user = await Chat.findOneAndUpdate(
            { _id: req.params.id },
            { $set: { title: req.body.title } }
        );

        res.sendStatus(user === null ? 400 : 200);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
}

async function addUserToChat(req, res) {
    try {
        const user = await User.findOne({
            _id: { $regex: `^${req.params.nickname}$`, $options: 'i' }
        });

        if (!user) {
            return res.sendStatus(400);
        }

        const chat = await Chat.findOneAndUpdate(
            { _id: req.params.id, type: 'group' },
            { $push: { members: req.params.nickname } }
        );

        res.sendStatus(chat === null ? 400 : 200);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

async function deleteUserFromChat(req, res) {
    const chat = await Chat.findOneAndUpdate(
        { _id: req.params.id, type: 'group' },
        { $pull: { members: req.params.nickname } }
    );

    res.sendStatus(chat === null ? 400 : 200);
}

module.exports = {
    getChats, getMessages, createMessage, updateUserAvatar,
    getUser, createChat, createUser, addUserToChat, deleteUserFromChat,
    updateChatAvatar, updateChatTitle
};
