import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash('admin123', 10);
  const studentHash = await bcrypt.hash('student123', 10);

  await prisma.user.upsert({
    where: { email: 'fpmiadmin45@proton.me' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'fpmiadmin45@proton.me',
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });

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

  const professors = [
    {
      name: 'доц. д-р Иван Петров',
      email: 'i.petrov@fpmi.bg',
      office: 'каб. 215',
      bio: 'Преподава програмиране и структури от данни.',
    },
    {
      name: 'проф. д-р Мария Георгиева',
      email: 'm.georgieva@fpmi.bg',
      office: 'каб. 308',
      bio: 'Преподава бази данни и анализ на данни.',
    },
    {
      name: 'доц. д-р Димитър Иванов',
      email: 'd.ivanov@fpmi.bg',
      office: 'каб. 222',
      bio: 'Преподава математически анализ и диференциални уравнения.',
    },
    {
      name: 'проф. дн Елена Костова',
      email: 'e.kostova@fpmi.bg',
      office: 'каб. 308',
      bio: 'Преподава числени методи и математическо моделиране.',
    },
  ];

  for (const professor of professors) {
    const existing = await prisma.professor.findFirst({
      where: { name: professor.name },
    });
    if (!existing) {
      await prisma.professor.create({ data: professor });
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
