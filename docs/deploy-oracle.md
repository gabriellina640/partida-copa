# Deploy na Oracle Cloud Always Free

Este projeto roda bem em uma VM Oracle porque frontend, backend e Socket.IO ficam no mesmo processo Node.

## 1. Criar a VM

1. Crie uma conta no Oracle Cloud Free Tier.
2. Crie uma instancia Compute Always Free com Ubuntu.
3. Preferencia: Ampere A1, 1 OCPU e 6 GB RAM, se houver disponibilidade.
4. Adicione sua chave SSH publica na criacao da VM.
5. Garanta que a VM tenha IP publico.

## 2. Liberar portas na Oracle

Na Virtual Cloud Network da instancia, adicione regras de entrada:

- TCP 22 para SSH.
- TCP 80 para HTTP.
- TCP 443 para HTTPS, se for usar dominio com certificado.

Nao exponha a porta 3001 publicamente se usar Nginx como proxy.

## 3. Acessar a VM

```bash
ssh ubuntu@IP_DA_VM
```

## 4. Instalar dependencias

```bash
sudo apt-get update
sudo apt-get install -y git curl nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

## 5. Enviar ou clonar o projeto

Com Git:

```bash
git clone URL_DO_REPOSITORIO partida-copa
cd partida-copa
```

Ou envie a pasta do projeto para a VM e entre nela.

## 6. Instalar, testar e buildar

```bash
npm ci
npm test
npm run build
```

## 7. Subir com PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd
```

O ultimo comando imprime outro comando com `sudo`. Copie e execute exatamente como o PM2 mostrar.

## 8. Configurar Nginx

Crie o arquivo:

```bash
sudo nano /etc/nginx/sites-available/partida-copa
```

Conteudo para acesso por IP:

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ative:

```bash
sudo ln -s /etc/nginx/sites-available/partida-copa /etc/nginx/sites-enabled/partida-copa
sudo nginx -t
sudo systemctl reload nginx
```

Depois acesse:

```text
http://IP_DA_VM
```

## 9. Operacao no dia

- Telão/admin: `http://IP_DA_VM/`
- Equipes: `http://IP_DA_VM/equipe`
- Senha admin: `10203040`
- Health check: `http://IP_DA_VM/health`

## 10. Comandos uteis

Ver logs:

```bash
pm2 logs partida-copa
```

Reiniciar:

```bash
pm2 restart partida-copa
```

Atualizar depois de um novo deploy:

```bash
git pull
npm ci
npm test
npm run build
pm2 restart partida-copa
```

## Observacoes importantes

- O estado da partida fica salvo em `server/game-snapshot.json`.
- Nao apague esse arquivo durante uma partida.
- Como a VM tem disco persistente, a retomada emergencial fica mais confiavel do que em hospedagens free com filesystem efemero.
- Para HTTPS com dominio, use Certbot depois que o dominio apontar para o IP da VM.
