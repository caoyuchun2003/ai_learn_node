#!/usr/bin/env node

// 数据库初始化脚本 (Node.js版本)

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 开始初始化数据库...\n');

const backendDir = path.join(__dirname, '..');

try {
  // 生成Prisma Client
  console.log('📦 生成Prisma Client...');
  execSync('npm run prisma:generate', { 
    cwd: backendDir, 
    stdio: 'inherit' 
  });

  // 运行数据库迁移
  console.log('\n🗄️  创建数据库和表结构...');
  execSync('npm run prisma:migrate -- --name init', { 
    cwd: backendDir, 
    stdio: 'inherit' 
  });

  // 填充初始数据
  console.log('\n🌱 填充初始课程数据...');
  execSync('npm run prisma:seed', { 
    cwd: backendDir, 
    stdio: 'inherit' 
  });

  console.log('\n✅ 数据库初始化完成！');
  console.log('\n数据库文件位置: backend/prisma/dev.db');
  console.log('现在可以运行 "npm run dev" 启动服务器了\n');
} catch (error) {
  console.error('\n❌ 数据库初始化失败:', error.message);
  process.exit(1);
}
