const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://gabrielwandall:senha456@cluster1.0yo8hvh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const dbName = 'Simoldes';
const collectionName = 'usuarios';

async function conectar() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db(dbName).collection(collectionName);
}

async function adicionarUsuario(usuario) {
  const collection = await conectar();
  return collection.insertOne(usuario);
}

async function buscarUsuarios(filtro = {}) {
  const collection = await conectar();
  return collection.find(filtro).toArray();
}

async function atualizarUsuario(filtro, atualizacao) {
  const collection = await conectar();
  return collection.updateOne(filtro, { $set: atualizacao });
}

async function deletarUsuario(filtro) {
  const collection = await conectar();
  return collection.deleteOne(filtro);
}

module.exports = {
  adicionarUsuario,
  buscarUsuarios,
  atualizarUsuario,
  deletarUsuario
}; 