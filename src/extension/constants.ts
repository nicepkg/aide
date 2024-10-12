export const AbortError = new Error('AbortError')

export const AI_SUPPORT_IMG_EXT = ['jpg', 'jpeg', 'png']

export const DEFAULT_IGNORE_FILETYPES = [
  '**/*.DS_Store',
  '**/*-lock.json',
  '**/*.lock',
  '**/*.log',
  '**/*.ttf',
  '**/*.png',
  '**/*.jpg',
  '**/*.jpeg',
  '**/*.gif',
  '**/*.mp4',
  '**/*.svg',
  '**/*.ico',
  '**/*.pdf',
  '**/*.zip',
  '**/*.gz',
  '**/*.tar',
  '**/*.dmg',
  '**/*.tgz',
  '**/*.rar',
  '**/*.7z',
  '**/*.exe',
  '**/*.dll',
  '**/*.obj',
  '**/*.o',
  '**/*.o.d',
  '**/*.a',
  '**/*.lib',
  '**/*.so',
  '**/*.dylib',
  '**/*.ncb',
  '**/*.sdf',
  '**/*.woff',
  '**/*.woff2',
  '**/*.eot',
  '**/*.cur',
  '**/*.avi',
  '**/*.mpg',
  '**/*.mpeg',
  '**/*.mov',
  '**/*.mp3',
  '**/*.mp4',
  '**/*.mkv',
  '**/*.mkv',
  '**/*.webm',
  '**/*.jar',
  '**/*.onnx',
  '**/*.parquet',
  '**/*.pqt',
  '**/*.wav',
  '**/*.webp',
  '**/*.db',
  '**/*.sqlite',
  '**/*.wasm',
  '**/*.plist',
  '**/*.profraw',
  '**/*.gcda',
  '**/*.gcno',
  '**/go.sum',
  '**/*.env',
  '**/*.gitignore',
  '**/*.gitkeep',
  '**/*.continueignore',
  '**/*.csv',
  '**/*.uasset',
  '**/*.pdb',
  '**/*.bin'
  // "**/*.prompt", // can be incredibly confusing for the LLM to have another set of instructions injected into the prompt
]

export const IGNORE_FILETYPES_WITHOUT_IMG = DEFAULT_IGNORE_FILETYPES.filter(
  filetype => !AI_SUPPORT_IMG_EXT.some(ext => filetype.endsWith(ext))
)

export const PRE_INDEX_DOCS = [
  {
    title: 'Jinja',
    url: 'https://jinja.palletsprojects.com/en/3.1.x/'
  },
  {
    title: 'React',
    url: 'https://react.dev/reference/'
  },
  {
    title: 'PostHog',
    url: 'https://posthog.com/docs'
  },
  {
    title: 'Express',
    url: 'https://expressjs.com/en/5x/api.html'
  },
  {
    title: 'OpenAI',
    url: 'https://platform.openai.com/docs/'
  },
  {
    title: 'Prisma',
    url: 'https://www.prisma.io/docs'
  },
  {
    title: 'Boto3',
    url: 'https://boto3.amazonaws.com/v1/documentation/api/latest/index.html'
  },
  {
    title: 'Pytorch',
    url: 'https://pytorch.org/docs/stable/'
  },
  {
    title: 'Redis',
    url: 'https://redis.io/docs/'
  },
  {
    title: 'Axios',
    url: 'https://axios-http.com/docs/intro'
  },
  {
    title: 'Redwood JS',
    url: 'https://redwoodjs.com/docs/introduction'
  },
  {
    title: 'GraphQL',
    url: 'https://graphql.org/learn/'
  },
  {
    title: 'Typescript',
    url: 'https://www.typescriptlang.org/docs/'
  },
  {
    title: 'Jest',
    url: 'https://jestjs.io/docs/getting-started'
  },
  {
    title: 'Tailwind CSS',
    url: 'https://tailwindcss.com/docs/installation'
  },
  {
    title: 'Vue.js',
    url: 'https://vuejs.org/guide/introduction.html'
  },
  {
    title: 'Svelte',
    url: 'https://svelte.dev/docs/introduction'
  },
  {
    title: 'GitHub Actions',
    url: 'https://docs.github.com/en/actions'
  },
  {
    title: 'NodeJS',
    url: 'https://nodejs.org/docs/latest/api/'
  },
  {
    title: 'Socket.io',
    url: 'https://socket.io/docs/v4/'
  },
  {
    title: 'Gradle',
    url: 'https://docs.gradle.org/current/userguide/userguide.html'
  },
  {
    title: 'Redux Toolkit',
    url: 'https://redux-toolkit.js.org/introduction/getting-started'
  },
  {
    title: 'Chroma',
    url: 'https://docs.trychroma.com/'
  },
  {
    title: 'SQLite',
    url: 'https://www.sqlite.org/docs.html'
  },
  {
    title: 'Redux',
    url: 'https://redux.js.org/introduction/getting-started'
  },
  {
    title: 'Prettier',
    url: 'https://prettier.io/docs/en/'
  },
  {
    title: 'VS Code Extension API',
    url: 'https://code.visualstudio.com/api'
  },
  {
    title: 'Continue',
    url: 'https://docs.continue.dev/intro'
  },
  {
    title: 'jQuery',
    url: 'https://api.jquery.com/'
  },
  {
    title: 'Python',
    url: 'https://docs.python.org/3/'
  },
  {
    title: 'Rust',
    url: 'https://doc.rust-lang.org/book/'
  },
  {
    title: 'IntelliJ Platform SDK',
    url: 'https://plugins.jetbrains.com/docs/intellij/welcome.html'
  },
  {
    title: 'Docker',
    url: 'https://docs.docker.com/'
  },
  {
    title: 'NPM',
    url: 'https://docs.npmjs.com/'
  },
  {
    title: 'TipTap',
    url: 'https://tiptap.dev/docs/editor/introduction'
  },
  {
    title: 'esbuild',
    url: 'https://esbuild.github.io/'
  },
  {
    title: 'Tree Sitter',
    url: 'https://tree-sitter.github.io/tree-sitter/'
  },
  {
    title: 'Netlify',
    url: 'https://docs.netlify.com/'
  },
  {
    title: 'Replicate',
    url: 'https://replicate.com/docs'
  },
  {
    title: 'HTML',
    url: 'https://www.w3schools.com/html/default.asp'
  },
  {
    title: 'CSS',
    url: 'https://www.w3schools.com/css/default.asp'
  },
  {
    title: 'Langchain',
    url: 'https://python.langchain.com/docs/get_started/introduction'
  },
  {
    title: 'WooCommerce',
    url: 'https://developer.woocommerce.com/docs/'
  },
  {
    title: 'WordPress',
    url: 'https://developer.wordpress.org/reference/'
  },
  {
    title: 'PySide6',
    url: 'https://doc.qt.io/qtforpython-6/quickstart.html'
  },
  {
    title: 'Bootstrap',
    url: 'https://getbootstrap.com/docs/5.3/getting-started/introduction/'
  },
  {
    title: 'Alpine.js',
    url: 'https://alpinejs.dev/start-here'
  },
  {
    title: 'C# Language Reference',
    url: 'https://learn.microsoft.com/en-us/dotnet/csharp/'
  },
  {
    title: 'Godot',
    url: 'https://docs.godotengine.org/en/latest/'
  }
]
