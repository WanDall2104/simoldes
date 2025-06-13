const http = require('http');
const url = require('url');
const { adicionarUsuario, buscarUsuarios, atualizarUsuario, deletarUsuario } = require('./scripts/usuariosRepository');

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  // Permitir CORS para facilitar testes locais
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  // Rota para login
  if (req.method === 'POST' && parsedUrl.pathname === '/api/login') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      const { matricula, senha } = JSON.parse(body);
      const usuarios = await buscarUsuarios({ matricula, senha });
      if (usuarios.length > 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ sucesso: true, usuario: usuarios[0] }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ sucesso: false, mensagem: 'Matrícula ou senha inválida.' }));
      }
    });
    return;
  }

  // Rota para adicionar usuário
  if (req.method === 'POST' && parsedUrl.pathname === '/api/usuarios') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      const usuario = JSON.parse(body);
      await adicionarUsuario(usuario);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ sucesso: true }));
    });
    return;
  }

  // Busca por matrícula (deve vir antes!)
  if (req.method === 'GET' && parsedUrl.pathname === '/api/usuarios' && parsedUrl.query.matricula) {
    const usuarios = await buscarUsuarios({ matricula: parsedUrl.query.matricula });
    if (usuarios.length > 0) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(usuarios[0]));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ erro: 'Usuário não encontrado' }));
    }
    return;
  }

  // Busca todos os usuários
  if (req.method === 'GET' && parsedUrl.pathname === '/api/usuarios') {
    const usuarios = await buscarUsuarios();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(usuarios));
    return;
  }

  // Rota para editar usuário
  if (req.method === 'PUT' && parsedUrl.pathname === '/api/usuarios') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      const { matriculaOriginal, nome, matricula, tipoUsuario } = JSON.parse(body);
      const filtro = { matricula: matriculaOriginal };
      const atualizacao = { nome, matricula, tipoUsuario };
      await atualizarUsuario(filtro, atualizacao);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ sucesso: true }));
    });
    return;
  }

  // Rota para excluir usuário
  if (req.method === 'DELETE' && parsedUrl.pathname === '/api/usuarios' && parsedUrl.query.matricula) {
    await deletarUsuario({ matricula: parsedUrl.query.matricula });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ sucesso: true }));
    return;
  }

  // Rota não encontrada
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ erro: 'Rota não encontrada' }));
});

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});