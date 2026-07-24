import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

if (process.env.NODE_ENV === 'production') {
  console.error('Seed should not be run in production. Aborting.');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const adminPassword = crypto.randomBytes(16).toString('hex');
  const adminHash = await bcrypt.hash(adminPassword, 10);
  const studentHash = await bcrypt.hash('student123', 10);

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com';

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Admin User',
      email: adminEmail,
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });
  console.log(`Admin user created with email: ${adminEmail}`);
  console.log(`Admin random password (change immediately): ${adminPassword}`);

  await prisma.user.upsert({
    where: { email: 'student@fpmi.bg' },
    update: {},
    create: {
      name: 'Student User',
      email: 'student@fpmi.bg',
      passwordHash: studentHash,
      role: Role.STUDENT,
    },
  });

  const courses = [
    // Семестър I
    {
      title: 'Линейна алгебра и аналитична геометрия',
      slug: 'lineyna-algebra',
      description: 'Вектори, матрици, детерминанти, линейни системи, аналитична геометрия в равнината и пространството.',
      semester: 1,
      credits: 9,
      category: 'Mathematics',
    },
    {
      title: 'Математически анализ I',
      slug: 'matematicheski-analiz-1',
      description: 'Граници, непрекъснатост, диференциално смятане на функции на една променлива.',
      semester: 1,
      credits: 9,
      category: 'Mathematics',
    },
    {
      title: 'Информатика I',
      slug: 'informatika-1',
      description: 'Основи на програмирането с C/C++. Алгоритми и структури от данни.',
      semester: 1,
      credits: 9,
      category: 'Programming',
    },

    // Семестър II
    {
      title: 'Математически анализ II',
      slug: 'matematicheski-analiz-2',
      description: 'Интегрално смятане на функции на една променлива, числови редове.',
      semester: 2,
      credits: 9,
      category: 'Mathematics',
    },
    {
      title: 'Информатика II',
      slug: 'informatika-2',
      description: 'Напреднало програмиране, структури от данни, алгоритми за търсене и сортиране.',
      semester: 2,
      credits: 9,
      category: 'Programming',
    },
    {
      title: 'Физика',
      slug: 'fizika',
      description: 'Класическа механика, електромагнетизъм, вълни и оптика.',
      semester: 2,
      credits: 6,
      category: 'Mathematics',
    },
    {
      title: 'Оптимиране',
      slug: 'optimirane',
      description: 'Линейно оптимиране, симплекс метод, транспортна задача, нелинейно оптимиране.',
      semester: 2,
      credits: 6,
      category: 'Data Analytics',
    },

    // Семестър III
    {
      title: 'Комплексен анализ',
      slug: 'kompleksen-analiz',
      description: 'Комплексни числа, аналитични функции, интеграли на Коши, редове на Лоран.',
      semester: 3,
      credits: 6,
      category: 'Mathematics',
    },
    {
      title: 'Обектно-ориентирано програмиране',
      slug: 'obektno-orientirano-programirane',
      description: 'Принципи на ООП — наследяване, полиморфизъм, капсулация, шаблони. Работа с C++ и Java.',
      semester: 3,
      credits: 6,
      category: 'Programming',
    },
    {
      title: 'Обикновени диференциални уравнения',
      slug: 'obiknoveni-diferencialni-uravneniya',
      description: 'ОДУ от първи и втори ред, системи ОДУ, преобразование на Лаплас.',
      semester: 3,
      credits: 6,
      category: 'Mathematics',
    },
    {
      title: 'Теоретична механика',
      slug: 'teoretichna-mehanika',
      description: 'Статика, кинематика, динамика на материална точка и система от точки.',
      semester: 3,
      credits: 5,
      category: 'Mathematics',
    },
    {
      title: 'Дискретни структури',
      slug: 'diskretni-strukturi',
      description: 'Множества, релации, графи, дървета, комбинаторика, булева алгебра.',
      semester: 3,
      credits: 6,
      category: 'Mathematics',
    },

    // Семестър IV
    {
      title: 'Висша алгебра и теория на числата',
      slug: 'vissha-algebra',
      description: 'Групи, пръстени, полета, линейна алгебра, теория на числата.',
      semester: 4,
      credits: 6,
      category: 'Mathematics',
    },
    {
      title: 'Въведение в числените методи',
      slug: 'vavedenie-v-chislentie-metodi',
      description: 'Числено решаване на уравнения, интерполация, числено интегриране.',
      semester: 4,
      credits: 5,
      category: 'Mathematics',
    },
    {
      title: 'Теория на вероятностите',
      slug: 'teoriya-na-veroyatnostite',
      description: 'Вероятностни пространства, случайни величини, разпределения, закон за големите числа.',
      semester: 4,
      credits: 6,
      category: 'Mathematics',
    },
    {
      title: 'Основи на операционните системи',
      slug: 'osnovi-na-operacionnite-sistemi',
      description: 'Процеси, нишки, синхронизация, управление на паметта, файлови системи.',
      semester: 4,
      credits: 6,
      category: 'Programming',
    },
    {
      title: 'Математически анализ III',
      slug: 'matematicheski-analiz-3',
      description: 'Функции на няколко променливи, кратни интеграли, криволинейни и повърхностни интеграли.',
      semester: 4,
      credits: 6,
      category: 'Mathematics',
    },

    // Семестър V
    {
      title: 'Математическо моделиране',
      slug: 'matematichesko-modelirane',
      description: 'Изграждане на математически модели на реални процеси и явления.',
      semester: 5,
      credits: 6,
      category: 'Mathematics',
    },
    {
      title: 'Уравнения на математическата физика',
      slug: 'uravneniya-na-matematicheskata-fizika',
      description: 'Вълново уравнение, уравнение на топлопроводността, уравнение на Лаплас.',
      semester: 5,
      credits: 6,
      category: 'Mathematics',
    },
    {
      title: 'Математическа статистика',
      slug: 'matematicheska-statistika',
      description: 'Статистически оценки, проверка на хипотези, регресионен и корелационен анализ.',
      semester: 5,
      credits: 9,
      category: 'Data Analytics',
    },
    {
      title: 'Финансова математика',
      slug: 'finansova-matematika',
      description: 'Лихви, анюитети, облигации, опции, стохастични модели във финансите.',
      semester: 5,
      credits: 6,
      category: 'Data Analytics',
    },
    {
      title: 'Мениджмънт и маркетинг',
      slug: 'menidzhmant-i-marketing',
      description: 'Основи на управлението, маркетингови стратегии, бизнес планиране.',
      semester: 5,
      credits: 5,
      category: 'Data Analytics',
    },

    // Семестър VI
    {
      title: 'Диференциална геометрия и топология',
      slug: 'diferencialna-geometriya',
      description: 'Криви и повърхнини, геодезични криви, основи на топологията.',
      semester: 6,
      credits: 6,
      category: 'Mathematics',
    },
    {
      title: 'Изследване на операциите',
      slug: 'izsledvane-na-operaciite',
      description: 'Теория на игрите, мрежово планиране, управление на запаси, опашки.',
      semester: 6,
      credits: 6,
      category: 'Data Analytics',
    },
    {
      title: 'Числено моделиране с ОДУ',
      slug: 'chisleno-modelirane-s-odu',
      description: 'Числени методи за решаване на обикновени диференциални уравнения.',
      semester: 6,
      credits: 6,
      category: 'Mathematics',
    },
    {
      title: 'Специализираща практика',
      slug: 'specializirashta-praktika',
      description: 'Практическо приложение на математически и софтуерни умения в реални проекти.',
      semester: 6,
      credits: 3,
      category: 'Programming',
    },

    // Семестър VII
    {
      title: 'Числено моделиране с ЧДУ',
      slug: 'chisleno-modelirane-s-chdu',
      description: 'Числени методи за решаване на частни диференциални уравнения — крайни разлики, крайни елементи.',
      semester: 7,
      credits: 6,
      category: 'Mathematics',
    },
    {
      title: 'Компютърна графика',
      slug: 'kompyutarna-grafika',
      description: '2D и 3D графика, трансформации, OpenGL, визуализация.',
      semester: 7,
      credits: 6,
      category: 'Programming',
    },
    {
      title: 'Изкуствен интелект и експертни системи',
      slug: 'izkustven-intelekt',
      description: 'Машинно обучение, невронни мрежи, експертни системи, логическо програмиране.',
      semester: 7,
      credits: 6,
      category: 'AI',
    },

    // Семестър VIII
    {
      title: 'Надеждност и масово обслужване',
      slug: 'nadezhdnost-i-masovo-obsluzhvane',
      description: 'Теория на надеждността, системи за масово обслужване, Марковски вериги.',
      semester: 8,
      credits: 6,
      category: 'Data Analytics',
    },
    {
      title: 'Разпознаване на образи',
      slug: 'razpoznavane-na-obrazi',
      description: 'Класификация, клъстеризация, невронни мрежи, SVM, разпознаване на изображения.',
      semester: 8,
      credits: 6,
      category: 'AI',
    },
    {
      title: 'Извличане на закономерности от данни',
      slug: 'izvlichane-na-zakonomernosti',
      description: 'Data mining, асоциативни правила, клъстеризация, класификация на големи данни.',
      semester: 8,
      credits: 6,
      category: 'Data Analytics',
    },
    {
      title: 'Информационна сигурност',
      slug: 'informatsionna-sigurnost',
      description: 'Криптография, мрежова сигурност, защита на системи и данни.',
      semester: 8,
      credits: 6,
      category: 'Cybersecurity',
    },
  ];

  for (const course of courses) {
    await prisma.course.upsert({
      where: { slug: course.slug },
      update: {},
      create: course,
    });
  }

  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    throw new Error('Admin user not found after seeding users');
  }

  const courseIdBySlug = async (slug: string) => {
    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course) {
      throw new Error(`Course not found for slug: ${slug}`);
    }
    return course.id;
  };

  const wikiPages: {
    courseSlug: string;
    slug: string;
    title: string;
    content: string;
  }[] = [
    {
      courseSlug: 'informatika-1',
      slug: 'uvod-v-programiraneto',
      title: 'Увод в програмирането',
      content: [
        '# Увод в програмирането',
        '',
        'Тази страница обобщава основните понятия от първите лекции по Информатика I.',
        '',
        '## Какво е програма?',
        '',
        'Програмата е поредица от инструкции, които компютърът изпълнява. Пишем я на език за програмиране (в курса — C++).',
        '',
        '## Първа програма',
        '',
        '```cpp',
        '#include <iostream>',
        '',
        'int main() {',
        '    std::cout << "Hello, FPMI!" << std::endl;',
        '    return 0;',
        '}',
        '```',
        '',
        '## Основни теми',
        '',
        '- Променливи и типове данни',
        '- Оператори за разклонение (`if`, `switch`)',
        '- Цикли (`for`, `while`, `do-while`)',
        '- Функции и обхват на променливите',
        '',
        '> **Съвет:** Упражнявайте всяка тема с поне 3 задачи от упражненията.',
      ].join('\n'),
    },
    {
      courseSlug: 'informatika-1',
      slug: 'strukturi-ot-danni',
      title: 'Структури от данни',
      content: [
        '# Структури от данни',
        '',
        'Преглед на основните структури, които се изучават в курса.',
        '',
        '## Линейни структури',
        '',
        '| Структура | Достъп | Вмъкване | Изтриване |',
        '|-----------|--------|----------|-----------|',
        '| Масив     | O(1)   | O(n)     | O(n)      |',
        '| Свързан списък | O(n) | O(1) | O(1) |',
        '| Стек      | O(1) (връх) | O(1) | O(1) |',
        '| Опашка    | O(1) (начало) | O(1) | O(1) |',
        '',
        '## Кога какво ползваме?',
        '',
        '- **Масив** — когато ни трябва бърз произволен достъп.',
        '- **Свързан списък** — при чести вмъквания/изтривания в средата.',
        '- **Стек** — за обратен ред (LIFO), напр. проверка на скоби.',
        '- **Опашка** — за обработка в реда на постъпване (FIFO).',
      ].join('\n'),
    },
    {
      courseSlug: 'matematicheski-analiz-1',
      slug: 'granici-i-neprekusnatost',
      title: 'Граници и непрекъснатост',
      content: [
        '# Граници и непрекъснатост',
        '',
        'Конспект по темата за граници на функции.',
        '',
        '## Дефиниция на граница',
        '',
        'Казваме, че функцията $f(x)$ има граница $L$ в точка $a$, ако за всяко $\\varepsilon > 0$ съществува $\\delta > 0$ такова, че:',
        '',
        '$$0 < |x - a| < \\delta \\implies |f(x) - L| < \\varepsilon$$',
        '',
        '## Важни граници',
        '',
        '- $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$',
        '- $\\lim_{x \\to 0} \\frac{e^x - 1}{x} = 1$',
        '- $\\lim_{x \\to \\infty} \\left(1 + \\frac{1}{x}\\right)^x = e$',
        '',
        '## Непрекъснатост',
        '',
        'Функция е непрекъсната в точка $a$, ако $\\lim_{x \\to a} f(x) = f(a)$.',
      ].join('\n'),
    },
    {
      courseSlug: 'obektno-orientirano-programirane',
      slug: 'principi-na-oop',
      title: 'Принципи на ООП',
      content: [
        '# Принципи на ООП',
        '',
        'Четирите основни принципа на обектно-ориентираното програмиране.',
        '',
        '## 1. Капсулация',
        '',
        'Скриваме вътрешното състояние и излагаме само публичен интерфейс.',
        '',
        '```cpp',
        'class BankAccount {',
        'private:',
        '    double balance;',
        'public:',
        '    void deposit(double amount) { balance += amount; }',
        '    double getBalance() const { return balance; }',
        '};',
        '```',
        '',
        '## 2. Наследяване',
        '',
        'Нов клас наследява полета и методи от базов клас.',
        '',
        '## 3. Полиморфизъм',
        '',
        'Един и същ интерфейс, различно поведение — чрез виртуални функции.',
        '',
        '## 4. Абстракция',
        '',
        'Моделираме само съществените характеристики на обекта.',
      ].join('\n'),
    },
  ];

  for (const page of wikiPages) {
    const courseId = await courseIdBySlug(page.courseSlug);
    await prisma.wikiPage.upsert({
      where: { courseId_slug: { courseId, slug: page.slug } },
      update: {},
      create: {
        courseId,
        slug: page.slug,
        title: page.title,
        content: page.content,
        createdById: admin.id,
      },
    });
  }

  const resources: {
    courseSlug: string;
    title: string;
    type: 'LINK' | 'VIDEO' | 'DOCUMENT' | 'BOOK' | 'OTHER';
    url: string;
  }[] = [
    {
      courseSlug: 'informatika-1',
      title: 'cppreference — справочник по C++',
      type: 'LINK',
      url: 'https://en.cppreference.com',
    },
    {
      courseSlug: 'informatika-1',
      title: 'learncpp.com — безплатен курс по C++',
      type: 'LINK',
      url: 'https://www.learncpp.com',
    },
    {
      courseSlug: 'matematicheski-analiz-1',
      title: 'Khan Academy — Calculus 1',
      type: 'VIDEO',
      url: 'https://www.khanacademy.org/math/calculus-1',
    },
    {
      courseSlug: 'obektno-orientirano-programirane',
      title: 'Design Patterns (GoF) — книга',
      type: 'BOOK',
      url: 'https://en.wikipedia.org/wiki/Design_Patterns',
    },
  ];

  for (const res of resources) {
    const courseId = await courseIdBySlug(res.courseSlug);
    const existing = await prisma.resource.findFirst({
      where: { courseId, title: res.title },
    });
    if (!existing) {
      await prisma.resource.create({
        data: {
          courseId,
          title: res.title,
          type: res.type,
          url: res.url,
          createdById: admin.id,
        },
      });
    }
  }

  const exams: {
    courseSlug: string;
    title: string;
    year: number;
    semester?: number;
    pdfUrl: string;
  }[] = [
    {
      courseSlug: 'informatika-1',
      title: 'Изпит — януари 2025',
      year: 2025,
      semester: 1,
      pdfUrl: 'https://example.com/exams/informatika-1-2025-01.pdf',
    },
    {
      courseSlug: 'informatika-1',
      title: 'Изпит — януари 2024',
      year: 2024,
      semester: 1,
      pdfUrl: 'https://example.com/exams/informatika-1-2024-01.pdf',
    },
    {
      courseSlug: 'matematicheski-analiz-1',
      title: 'Изпит — януари 2025',
      year: 2025,
      semester: 1,
      pdfUrl: 'https://example.com/exams/analiz-1-2025-01.pdf',
    },
  ];

  for (const exam of exams) {
    const courseId = await courseIdBySlug(exam.courseSlug);
    const existing = await prisma.exam.findFirst({
      where: { courseId, title: exam.title },
    });
    if (!existing) {
      await prisma.exam.create({
        data: {
          courseId,
          title: exam.title,
          year: exam.year,
          semester: exam.semester ?? null,
          pdfUrl: exam.pdfUrl,
          createdById: admin.id,
        },
      });
    }
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
