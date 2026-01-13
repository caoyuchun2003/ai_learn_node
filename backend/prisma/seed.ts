import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');

  // 清理现有数据
  await prisma.pathItem.deleteMany();
  await prisma.learningPath.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.course.deleteMany();

  // 创建机器学习基础课程
  const mlBasics1 = await prisma.course.create({
    data: {
      title: '线性回归',
      description: '学习线性回归的基本原理和实现方法，包括最小二乘法、梯度下降等核心概念。',
      category: 'ML_BASICS',
      difficulty: 'BEGINNER',
      estimatedHours: 3,
      chapters: {
        create: [
          {
            title: '什么是线性回归',
            order: 1,
            content: `# 什么是线性回归

线性回归是机器学习中最基础的算法之一，用于预测连续值。

## 基本概念

线性回归试图找到一条直线（或超平面），使得所有数据点到这条直线的距离之和最小。

### 数学表示

对于简单线性回归（一个特征），模型可以表示为：

\\\`\\\`\\\`python
y = wx + b
\\\`\\\`\\\`

其中：
- \`y\` 是预测值（目标变量）
- \`x\` 是输入特征
- \`w\` 是权重（斜率）
- \`b\` 是偏置（截距）

### 应用场景

- 房价预测
- 销售额预测
- 温度预测
- 任何需要预测连续值的场景

## 下一步

在下一章中，我们将学习如何使用最小二乘法来求解线性回归的参数。`,
          },
          {
            title: '最小二乘法',
            order: 2,
            content: `# 最小二乘法

最小二乘法是求解线性回归参数的标准方法。

## 原理

最小二乘法的目标是找到参数 \`w\` 和 \`b\`，使得预测值与真实值之间的平方误差最小：

\\\`\\\`\\\`python
损失函数 = Σ(y_i - (wx_i + b))²
\\\`\\\`\\\`

## 求解方法

### 1. 解析解（闭式解）

对于简单线性回归，可以直接计算：

\\\`\\\`\\\`python
w = Σ(x_i - x̄)(y_i - ȳ) / Σ(x_i - x̄)²
b = ȳ - w * x̄
\\\`\\\`\\\`

### 2. 矩阵形式

对于多元线性回归，可以使用矩阵运算：

\\\`\\\`\\\`python
θ = (X^T * X)^(-1) * X^T * y
\\\`\\\`\\\`

## 代码示例

\\\`\\\`\\\`python
import numpy as np

def linear_regression(X, y):
    # 添加偏置项
    X = np.column_stack([np.ones(len(X)), X])
    
    # 计算参数
    theta = np.linalg.inv(X.T @ X) @ X.T @ y
    
    return theta
\\\`\\\`\\\`

## 总结

最小二乘法提供了线性回归的精确解，但在大数据集上计算成本较高。下一章我们将学习更高效的梯度下降方法。`,
          },
          {
            title: '梯度下降',
            order: 3,
            content: `# 梯度下降

梯度下降是一种优化算法，用于找到损失函数的最小值。

## 基本思想

梯度下降通过迭代更新参数，沿着损失函数梯度的反方向移动，逐步接近最优解。

## 算法步骤

1. 初始化参数 \`w\` 和 \`b\`
2. 计算损失函数的梯度
3. 更新参数：\`θ = θ - α * ∇θ\`
4. 重复步骤2-3直到收敛

其中 \`α\` 是学习率。

## 代码实现

\\\`\\\`\\\`python
import numpy as np

def gradient_descent(X, y, learning_rate=0.01, iterations=1000):
    m = len(y)
    theta = np.zeros(X.shape[1])
    
    for i in range(iterations):
        # 计算预测值
        predictions = X @ theta
        
        # 计算梯度
        gradient = (1/m) * X.T @ (predictions - y)
        
        # 更新参数
        theta = theta - learning_rate * gradient
        
        # 可选：打印损失
        if i % 100 == 0:
            loss = np.mean((predictions - y) ** 2)
            print(f'Iteration {i}, Loss: {loss}')
    
    return theta
\\\`\\\`\\\`

## 学习率选择

- 学习率太小：收敛慢
- 学习率太大：可能无法收敛或震荡
- 建议：从0.01开始，根据实际情况调整

## 总结

梯度下降是深度学习的核心优化算法，理解它对于后续学习非常重要。`,
          },
        ],
      },
    },
  });

  const mlBasics2 = await prisma.course.create({
    data: {
      title: '逻辑回归',
      description: '学习逻辑回归用于分类问题的原理和应用，包括sigmoid函数、损失函数等。',
      category: 'ML_BASICS',
      difficulty: 'BEGINNER',
      estimatedHours: 4,
      chapters: {
        create: [
          {
            title: '分类问题',
            order: 1,
            content: `# 分类问题

逻辑回归是用于解决分类问题的算法。

## 分类 vs 回归

- **回归**：预测连续值（如房价、温度）
- **分类**：预测离散类别（如垃圾邮件/正常邮件、猫/狗）

## 二分类问题

逻辑回归主要用于二分类问题，输出是0或1。

### 示例场景

- 邮件分类：垃圾邮件（1）或正常邮件（0）
- 疾病诊断：患病（1）或健康（0）
- 客户流失：流失（1）或保留（0）

## 为什么不能用线性回归？

线性回归的输出可以是任意实数，不适合分类问题。我们需要将输出映射到[0,1]区间。

## 下一步

下一章我们将学习sigmoid函数，它是逻辑回归的核心。`,
          },
          {
            title: 'Sigmoid函数',
            order: 2,
            content: `# Sigmoid函数

Sigmoid函数将任意实数映射到(0,1)区间，非常适合二分类问题。

## 函数定义

\\\`\\\`\\\`python
σ(z) = 1 / (1 + e^(-z))
\\\`\\\`\\\`

## 特性

- 输出范围：(0, 1)
- 单调递增
- S型曲线
- 当z=0时，σ(z)=0.5

## 代码实现

\\\`\\\`\\\`python
import numpy as np
import matplotlib.pyplot as plt

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

# 示例
z = np.linspace(-10, 10, 100)
y = sigmoid(z)

plt.plot(z, y)
plt.xlabel('z')
plt.ylabel('σ(z)')
plt.title('Sigmoid Function')
plt.grid(True)
plt.show()
\\\`\\\`\\\`

## 在逻辑回归中的应用

逻辑回归模型：

\\\`\\\`\\\`python
h(x) = σ(wx + b) = 1 / (1 + e^(-(wx + b)))
\\\`\\\`\\\`

输出可以解释为概率：P(y=1|x)

## 总结

Sigmoid函数是逻辑回归的基础，理解它对于掌握分类算法至关重要。`,
          },
        ],
      },
    },
  });

  // 创建深度学习课程
  const dl1 = await prisma.course.create({
    data: {
      title: '神经网络基础',
      description: '从感知机到多层神经网络，学习神经网络的基本原理和结构。',
      category: 'DEEP_LEARNING',
      difficulty: 'INTERMEDIATE',
      estimatedHours: 5,
      chapters: {
        create: [
          {
            title: '感知机',
            order: 1,
            content: `# 感知机

感知机是神经网络的基础，是最简单的神经网络模型。

## 什么是感知机

感知机是一个二分类的线性分类模型，由输入层和输出层组成。

## 结构

\\\`\\\`\\\`python
输入 → 权重 → 求和 → 激活函数 → 输出
\\\`\\\`\\\`

## 数学表示

\\\`\\\`\\\`python
y = f(Σ(w_i * x_i) + b)
\\\`\\\`\\\`

其中f是激活函数（如阶跃函数）。

## 局限性

单层感知机只能解决线性可分问题，无法处理XOR等非线性问题。

## 下一步

多层感知机（MLP）可以解决非线性问题，我们将在下一章学习。`,
          },
          {
            title: '多层神经网络',
            order: 2,
            content: `# 多层神经网络

多层神经网络（MLP）通过增加隐藏层来解决非线性问题。

## 网络结构

- **输入层**：接收特征
- **隐藏层**：一个或多个，进行特征变换
- **输出层**：产生最终预测

## 前向传播

\\\`\\\`\\\`python
# 第一层
z1 = W1 @ x + b1
a1 = activation(z1)

# 第二层
z2 = W2 @ a1 + b2
a2 = activation(z2)

# 输出层
output = softmax(z2)  # 对于多分类
\\\`\\\`\\\`

## 激活函数

常用的激活函数：
- ReLU: \`f(x) = max(0, x)\`
- Sigmoid: \`f(x) = 1/(1+e^(-x))\`
- Tanh: \`f(x) = tanh(x)\`

## 为什么需要激活函数？

没有激活函数，多层网络等价于单层网络。激活函数引入非线性，使网络能够学习复杂模式。

## 总结

多层神经网络是深度学习的基础，理解其结构对于后续学习CNN、RNN等模型非常重要。`,
          },
        ],
      },
    },
  });

  const dl2 = await prisma.course.create({
    data: {
      title: '卷积神经网络（CNN）',
      description: '学习CNN在图像处理中的应用，包括卷积层、池化层等核心概念。',
      category: 'DEEP_LEARNING',
      difficulty: 'INTERMEDIATE',
      estimatedHours: 6,
      chapters: {
        create: [
          {
            title: '卷积操作',
            order: 1,
            content: `# 卷积操作

卷积是CNN的核心操作，用于提取图像特征。

## 什么是卷积

卷积是一种数学运算，通过滑动窗口（卷积核）在输入上移动，计算局部区域的加权和。

## 卷积过程

1. 将卷积核放在输入图像的左上角
2. 计算卷积核覆盖区域的元素乘积之和
3. 将结果写入输出特征图
4. 滑动卷积核，重复步骤2-3

## 代码示例

\\\`\\\`\\\`python
import numpy as np
from scipy import signal

# 简单的卷积实现
def convolve2d(image, kernel):
    return signal.convolve2d(image, kernel, mode='valid')
\\\`\\\`\\\`

## 卷积核的作用

不同的卷积核可以检测不同的特征：
- 边缘检测
- 模糊
- 锐化
- 特征提取

## 总结

理解卷积操作是掌握CNN的关键第一步。`,
          },
        ],
      },
    },
  });

  // 创建NLP课程
  const nlp1 = await prisma.course.create({
    data: {
      title: '文本预处理',
      description: '学习NLP中的文本预处理技术，包括分词、去停用词、词干提取等。',
      category: 'NLP',
      difficulty: 'BEGINNER',
      estimatedHours: 3,
      chapters: {
        create: [
          {
            title: '分词',
            order: 1,
            content: `# 分词

分词是将文本切分成词语的过程，是NLP的基础步骤。

## 中文分词

中文没有明显的词边界，需要专门的分词工具：

\\\`\\\`\\\`python
import jieba

text = "自然语言处理是人工智能的重要分支"
words = jieba.cut(text)
print(list(words))
# ['自然语言', '处理', '是', '人工智能', '的', '重要', '分支']
\\\`\\\`\\\`

## 英文分词

英文分词相对简单，通常按空格分割：

\\\`\\\`\\\`python
text = "Natural language processing is important"
words = text.split()
print(words)
# ['Natural', 'language', 'processing', 'is', 'important']
\\\`\\\`\\\`

## 分词工具

- 中文：jieba, HanLP
- 英文：NLTK, spaCy

## 总结

准确的分词是后续NLP任务的基础。`,
          },
        ],
      },
    },
  });

  const nlp2 = await prisma.course.create({
    data: {
      title: '词向量',
      description: '学习词嵌入和词向量的表示方法，包括Word2Vec、GloVe等。',
      category: 'NLP',
      difficulty: 'INTERMEDIATE',
      estimatedHours: 5,
      chapters: {
        create: [
          {
            title: '词嵌入基础',
            order: 1,
            content: `# 词嵌入基础

词嵌入是将词语映射到低维连续向量空间的技术。

## 为什么需要词向量？

传统方法（如one-hot编码）的问题：
- 维度高（词汇表大小）
- 稀疏
- 无法表示词语间的语义关系

## 词向量的优势

- 低维密集表示
- 语义相似的词向量距离近
- 可以进行向量运算（如：king - man + woman ≈ queen）

## Word2Vec

Word2Vec是经典的词向量训练方法，包括：
- Skip-gram：用中心词预测上下文
- CBOW：用上下文预测中心词

## 使用预训练词向量

\\\`\\\`\\\`python
from gensim.models import Word2Vec

# 加载预训练模型
model = Word2Vec.load('word2vec.model')
vector = model.wv['人工智能']
\\\`\\\`\\\`

## 总结

词向量是现代NLP的基础，理解它对于学习Transformer和LLM非常重要。`,
          },
        ],
      },
    },
  });

  // 创建LLM课程
  const llm1 = await prisma.course.create({
    data: {
      title: 'GPT原理',
      description: '深入理解GPT（Generative Pre-trained Transformer）的工作原理和架构。',
      category: 'LLM',
      difficulty: 'ADVANCED',
      estimatedHours: 8,
      chapters: {
        create: [
          {
            title: 'Transformer架构',
            order: 1,
            content: `# Transformer架构

GPT基于Transformer架构，理解Transformer是理解GPT的基础。

## Transformer核心组件

1. **自注意力机制（Self-Attention）**
2. **位置编码（Positional Encoding）**
3. **前馈神经网络（Feed-Forward）**
4. **层归一化（Layer Normalization）**

## 自注意力机制

自注意力允许模型关注输入序列的不同位置：

\\\`\\\`\\\`python
Attention(Q, K, V) = softmax(QK^T / √d_k) V
\\\`\\\`\\\`

其中：
- Q: Query（查询）
- K: Key（键）
- V: Value（值）

## GPT的改进

GPT使用：
- 仅解码器（Decoder-only）架构
- 因果掩码（Causal Masking）确保自回归生成
- 位置编码

## 总结

Transformer是GPT的基础，理解其架构对于掌握大语言模型至关重要。`,
          },
          {
            title: '预训练与微调',
            order: 2,
            content: `# 预训练与微调

GPT采用两阶段训练：预训练和微调。

## 预训练阶段

在大规模无标注文本上训练，学习语言的基本规律：

\\\`\\\`\\\`python
# 目标：预测下一个词
损失 = -log P(w_t | w_1, ..., w_{t-1})
\\\`\\\`\\\`

## 微调阶段

在特定任务上微调，如：
- 文本分类
- 问答
- 文本生成

## 代码示例

\\\`\\\`\\\`python
from transformers import GPT2LMHeadModel, GPT2Tokenizer

# 加载预训练模型
model = GPT2LMHeadModel.from_pretrained('gpt2')
tokenizer = GPT2Tokenizer.from_pretrained('gpt2')

# 微调（伪代码）
for batch in training_data:
    outputs = model(batch.input_ids)
    loss = compute_loss(outputs, batch.labels)
    loss.backward()
    optimizer.step()
\\\`\\\`\\\`

## 总结

预训练+微调是GPT成功的关键，这种范式被广泛应用于大语言模型。`,
          },
        ],
      },
    },
  });

  const llm2 = await prisma.course.create({
    data: {
      title: 'Prompt工程',
      description: '学习如何编写有效的Prompt来引导大语言模型生成期望的输出。',
      category: 'LLM',
      difficulty: 'INTERMEDIATE',
      estimatedHours: 4,
      chapters: {
        create: [
          {
            title: 'Prompt基础',
            order: 1,
            content: `# Prompt基础

Prompt是用户输入给大语言模型的指令或问题。

## 什么是Prompt

Prompt是引导模型生成特定输出的文本输入。

## 好的Prompt的特征

1. **清晰明确**：明确表达需求
2. **提供上下文**：给出必要的背景信息
3. **指定格式**：如果需要特定格式，明确说明
4. **示例引导**：提供few-shot示例

## 示例

### 不好的Prompt
\\\`\\\`\\\`
翻译
\\\`\\\`\\\`

### 好的Prompt
\\\`\\\`\\\`
请将以下英文翻译成中文：
"Hello, how are you?"
\\\`\\\`\\\`

## Prompt技巧

- **角色设定**：让模型扮演特定角色
- **思维链**：引导模型逐步思考
- **输出格式**：指定JSON、Markdown等格式

## 总结

掌握Prompt工程是有效使用大语言模型的关键技能。`,
          },
        ],
      },
    },
  });

  // 创建AI工具课程
  const tools1 = await prisma.course.create({
    data: {
      title: 'LangChain入门',
      description: '学习使用LangChain构建AI应用，包括链式调用、记忆、工具等核心概念。',
      category: 'AI_TOOLS',
      difficulty: 'INTERMEDIATE',
      estimatedHours: 6,
      chapters: {
        create: [
          {
            title: 'LangChain简介',
            order: 1,
            content: `# LangChain简介

LangChain是一个用于构建LLM应用的框架。

## 为什么需要LangChain

直接使用LLM API的问题：
- 上下文管理复杂
- 难以集成外部数据
- 缺乏可复用组件

LangChain提供了：
- 模块化组件
- 链式调用
- 数据连接
- 记忆管理

## 核心概念

1. **LLM/聊天模型**：与语言模型交互
2. **提示模板**：可复用的Prompt
3. **链（Chain）**：组合多个组件
4. **代理（Agent）**：使用工具执行任务
5. **记忆（Memory）**：管理对话历史

## 快速开始

\\\`\\\`\\\`python
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate

llm = OpenAI(temperature=0.9)
prompt = PromptTemplate(
    input_variables=["topic"],
    template="写一篇关于{topic}的短文。"
)

chain = prompt | llm
result = chain.invoke({"topic": "人工智能"})
print(result)
\\\`\\\`\\\`

## 总结

LangChain大大简化了LLM应用的开发，是构建AI应用的重要工具。`,
          },
        ],
      },
    },
  });

  const tools2 = await prisma.course.create({
    data: {
      title: 'Hugging Face使用',
      description: '学习使用Hugging Face Transformers库加载和使用预训练模型。',
      category: 'AI_TOOLS',
      difficulty: 'BEGINNER',
      estimatedHours: 4,
      chapters: {
        create: [
          {
            title: 'Transformers库',
            order: 1,
            content: `# Transformers库

Hugging Face Transformers提供了大量预训练模型。

## 安装

\\\`\\\`\\\`bash
pip install transformers torch
\\\`\\\`\\\`

## 使用预训练模型

\\\`\\\`\\\`python
from transformers import AutoTokenizer, AutoModelForCausalLM

# 加载模型和分词器
tokenizer = AutoTokenizer.from_pretrained("gpt2")
model = AutoModelForCausalLM.from_pretrained("gpt2")

# 编码输入
inputs = tokenizer("人工智能是", return_tensors="pt")

# 生成文本
outputs = model.generate(**inputs, max_length=50)
text = tokenizer.decode(outputs[0])
print(text)
\\\`\\\`\\\`

## 模型Hub

Hugging Face Hub提供了数万个预训练模型：
- 文本生成：GPT-2, GPT-Neo
- 文本分类：BERT, RoBERTa
- 翻译：mBART, T5

## 总结

Transformers库让使用预训练模型变得非常简单，是AI开发的重要工具。`,
          },
        ],
      },
    },
  });

  console.log('数据库初始化完成！');
  console.log(`创建了 ${await prisma.course.count()} 门课程`);
  console.log(`创建了 ${await prisma.chapter.count()} 个章节`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
