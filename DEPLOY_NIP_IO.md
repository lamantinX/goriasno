# Руководство по хостингу через nip.io 🚀

Это руководство содержит подробные инструкции по развертыванию и хостингу вашего веб-приложения **«ГориЯсно»** с использованием бесплатного сервиса wildcard-DNS **nip.io**.

---

## 💡 Что такое nip.io?
**nip.io** — это бесплатный wildcard DNS-сервис, который преобразует любое имя хоста, содержащее IP-адрес, обратно в этот же IP-адрес.
Например:
* `127.0.0.1.nip.io` ➔ разрешается в `127.0.0.1` (localhost)
* `app.192.168.1.100.nip.io` ➔ разрешается в `192.168.1.100` (локальная сеть)
* `goriyasno.95.217.11.44.nip.io` ➔ разрешается в `95.217.11.44` (публичный IP вашего VPS)

Это избавляет от необходимости покупать доменное имя для тестирования и публикации промежуточных (staging) сборок вашего сайта.

---

## 🛠 Шаг 1. Локальный запуск разработчика (Dev Server)
Мы обновили `vite.config.ts`, чтобы разрешить любые входящие Host-заголовки (`allowedHosts: true`). Теперь вы можете запустить сервер разработки и обращаться к нему по любому nip.io-адресу!

1. Установите зависимости и запустите dev-сервер:
   ```bash
   npm install
   npm run dev
   ```
2. Откройте браузер и введите адрес с вашим локальным IP. Например, если ваш локальный сетевой IP — `192.168.1.50`, перейдите по:
   `http://192.168.1.50.nip.io:3000`

---

## 📦 Шаг 2. Сборка проекта для продакшена
Поскольку это React-приложение (Vite SPA), перед запуском на удаленном хостинге его нужно скомпилировать в статичные оптимизированные файлы:

```bash
npm run build
```

Все скомпилированные файлы (HTML, JS, CSS, картинки) будут сохранены в директории `dist/`.

---

## 🌐 Шаг 3. Варианты деплоя и запуска через Nginx
Лучший способ захостить готовый проект на вашем сервере (VPS/VDS) под доменом `nip.io` — использовать веб-сервер **Nginx**.

### 1. Конфигурация Nginx (`/etc/nginx/sites-available/goriyasno`)
Создайте файл конфигурации Nginx, заменив `<YOUR_SERVER_IP>` на реальный IP вашего сервера (например, `95.217.11.44`):

```nginx
server {
    listen 80;
    
    # Слушать любое имя хоста, оканчивающееся на ваш IP.nip.io
    server_name <YOUR_SERVER_IP>.nip.io *.<YOUR_SERVER_IP>.nip.io;

    # Путь к скомпилированным статическим файлам приложения (папка dist)
    root /var/www/goriyasno/dist;
    index index.html;

    location / {
        # Стандартный роутинг для React SPA (поддержка путей на стороне клиента)
        try_files $uri $uri/ /index.html;
    }

    # Кэширование статических ассетов для высокой производительности
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Логи
    access_log /var/log/nginx/goriyasno_access.log;
    error_log /var/log/nginx/goriyasno_error.log;
}
```

### 2. Активация конфигурации
Скопируйте вашу папку `dist/` на сервер в директорию `/var/www/goriyasno/dist`. Затем выполните:

```bash
# Включение конфигурации в Nginx
sudo ln -s /etc/nginx/sites-available/goriyasno /etc/nginx/sites-enabled/

# Проверка конфигурации Nginx на наличие ошибок
sudo nginx -t

# Перезапуск веб-сервера
sudo systemctl restart nginx
```

После этого ваш лендинг «ГориЯсно» будет доступен по адресу `http://<YOUR_SERVER_IP>.nip.io`!

---

## 🐳 Шаг 4. Деплой через Docker (Альтернатива)
Если вы хотите упаковать приложение в легкий и изолированный Docker-контейнер и захостить его без ручной настройки Nginx на сервере:

### 1. Создайте `Dockerfile` в корне проекта:
```dockerfile
# Сборка приложения
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Сервер Nginx для раздачи статики
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Копируем кастомную конфигурацию Nginx (с поддержкой SPA роутинга)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Создайте файл `nginx.conf` рядом с Dockerfile:
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. Сборка и запуск контейнера:
Запустите сборку контейнера и пробросьте порт `80`:
```bash
docker build -t goriyasno-app .
docker run -d -p 80:80 --name goriyasno-container goriyasno-app
```

Теперь любое обращение к `http://<YOUR_SERVER_IP>.nip.io` будет автоматически перенаправлено вашим провайдером/сервером в Docker-контейнер, обслуживающий приложение!
