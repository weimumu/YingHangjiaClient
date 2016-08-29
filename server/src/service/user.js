import _ from 'lodash';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import db from '../models';

const ObjectId = mongoose.Types.ObjectId;

async function getUser(id) {
  return await db.user.findOne({
    name: id,
  }, '-password');
}

async function createUser(user, requiredAttr) {
  const user_ = _.pick(user, requiredAttr);

  const salt = bcrypt.genSaltSync(10);
  user_.password = bcrypt.hashSync(user.password, salt);

  await db.user.create(user_);
}

async function checkUser(user) {
  const user_ = _.pick(user, ['name', 'password']);

  const res = await db.user.findOne({
    name: user_.name,
  });

  if (!res) {
    return Promise.reject('用户不存在');
  } else {
    const match = bcrypt.compareSync(user_.password, res.password);

    if (!match) {
      return Promise.reject('密码错误');
    }
  }
}

async function addNewsStar(userId, newsId) {
  await db.user.update({
    _id: ObjectId(userId),
  }, {
    $push: {
      starNews: newsId,
    },
  });
}

async function addProdStar(userId, prodId) {
  await db.user.update({
    _id: ObjectId(userId),
  }, {
    $push: {
      starProd: prodId,
    },
  });
}

async function getNewsStar(userId) {
  const stars = await db.user.findOne({
    _id: ObjectId(userId),
  }, '-_id starNews');

  if (!stars || stars.length === 0) return [];

  return db.news.find({
    _id: {
      $in: stars.starNews,
    }
  }, '-__v');
}

async function getProdStar(userId) {
  const stars =  await db.user.findOne({
    _id: ObjectId(userId),
  }, '-_id starProd');

  if (!stars || stars.length === 0) return [];

  return db.prod.find({
    _id: {
      $in: stars.starProd,
    }
  }, '-__v');
}

async function delNewsStar(userId, starId) {
  await db.user.update({
    _id: ObjectId(userId),
  }, {
    $pull: {
      starNews: starId,
    },
  });
}

async function delProdStar(userId, starId) {
  await db.user.update({
    _id: ObjectId(userId),
  }, {
    $pull: {
      starProd: starId,
    },
  });
}

export default {
  getUser,
  getNewsStar,
  getProdStar,
  createUser,
  checkUser,
  addNewsStar,
  addProdStar,
  delNewsStar,
  delProdStar,
};
