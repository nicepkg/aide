import { t } from '@extension/i18n'

export interface ExpertCodeEnhancerPromptItem {
  match?: string | string[]
  title?: string
  prompt: string
  sort?: number
  autoContext?: boolean // need function_call, default is false
}

export const getDefaultExpertCodeEnhancerPromptList =
  (): ExpertCodeEnhancerPromptItem[] => {
    const defaultExpertCodeEnhancerPromptList: ExpertCodeEnhancerPromptItem[] =
      [
        {
          match: [
            '**/*.sql',
            '**/*Repository.{java,kt,scala,cs,py,js,ts}',
            '**/*Dao.{java,kt,scala,cs,py,js,ts}',
            '**/*Mapper.{java,kt,scala,cs,py,js,ts}',
            '**/*Query.{java,kt,scala,cs,py,js,ts}',
            '**/*.orm.{py,rb}',
            '**/*.entity.{ts,js}',
            '**/*Service.{java,kt,scala,cs,py,js,ts}'
          ],
          title: t('config.expertCodeEnhancerPromptList.databaseQueries'),
          prompt:
            'Analyze and optimize the database queries in the following code. Focus on improving query performance, reducing unnecessary joins, optimizing indexing suggestions, and ensuring efficient data retrieval patterns.',
          autoContext: true
        },
        {
          match: ['**/*.vue', '**/*.tsx', '**/*.jsx'],
          title: t('config.expertCodeEnhancerPromptList.splitComponents'),
          prompt:
            'Analyze the following code and split it into smaller, more manageable components. Focus on identifying reusable parts, separating concerns, and improving overall component structure. Provide the refactored code.',
          autoContext: true
        },
        {
          match: '**/*',
          title: t('config.expertCodeEnhancerPromptList.solid'),
          prompt:
            'Please refactor the following code to better adhere to SOLID principles. Focus on Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion where applicable. Explain your changes briefly in comments.',
          autoContext: false
        },
        {
          match: '**/*',
          title: t('config.expertCodeEnhancerPromptList.dry'),
          prompt:
            "Refactor the following code to eliminate redundancy and improve maintainability by applying the DRY (Don't Repeat Yourself) principle. Identify repeated code patterns and abstract them into reusable functions or classes as appropriate.",
          autoContext: false
        },
        {
          match: '**/*',
          title: t('config.expertCodeEnhancerPromptList.designPatterns'),
          prompt:
            'Refactor the following code by applying suitable design patterns where appropriate. Consider creational patterns like Singleton, Factory, and Builder; structural patterns like Adapter, Composite, and Decorator; and behavioral patterns like Strategy, Observer, and Command. Focus on improving flexibility, maintainability, and scalability. Avoid unnecessary complexity by choosing the most fitting patterns.',
          autoContext: false
        },
        {
          match: '**/*',
          title: t('config.expertCodeEnhancerPromptList.cleanliness'),
          prompt:
            'Refactor the following code to improve its cleanliness and readability. Focus on consistent naming conventions, appropriate comments, logical code organization, and reducing complexity. Ensure the code follows best practices for the given language.',
          autoContext: false
        },
        {
          match: '**/*',
          title: t('config.expertCodeEnhancerPromptList.optimizeConditionals'),
          prompt:
            'Refactor the following code to completely eliminate nested if-else structures. Use strategies like early returns, guard clauses, and polymorphism to improve clarity and readability. Explore switch statements and design patterns like strategy or state to ensure the code remains maintainable.',
          autoContext: false
        },
        {
          match: '**/*',
          title: t('config.expertCodeEnhancerPromptList.performance'),
          prompt:
            'Review the following code and optimize it for better performance. Focus on algorithmic efficiency, reducing unnecessary computations, and improving data structure usage. If applicable, consider asynchronous operations and memory management.',
          autoContext: true
        },
        {
          match: '**/*',
          title: t('config.expertCodeEnhancerPromptList.security'),
          prompt:
            'Review the following code and enhance its security measures. Focus on identifying and mitigating common vulnerabilities such as SQL injection, XSS, CSRF, and insecure data handling.',
          autoContext: true
        },
        {
          match: [
            '**/*.{java,kt,scala,cs,go,cpp,c,rs,py}',
            '**/*Async*.{java,kt,scala,cs,go,cpp,c,rs,py}',
            '**/*Parallel*.{java,kt,scala,cs,go,cpp,c,rs,py}',
            '**/*Concurrent*.{java,kt,scala,cs,go,cpp,c,rs,py}',
            '**/*Thread*.{java,kt,scala,cs,go,cpp,c,rs,py}',
            '**/*Worker*.{java,kt,scala,cs,go,cpp,c,rs,py}'
          ],
          title: t('config.expertCodeEnhancerPromptList.concurrency'),
          prompt:
            'Refactor the following  code to improve its concurrency and multithreading capabilities. Focus on efficient resource sharing, preventing race conditions, and enhancing overall parallel processing performance.',
          autoContext: true
        }
        //         {
        //           match: '**/*',
        //           title: t('config.expertCodeEnhancerPromptList.angryCritique'),
        //           prompt: `As a grumpy but well-meaning senior engineer, review the following code and provide brutally honest commentary. Add only comments, don't modify the existing code. Point out poor practices, inefficiencies, and questionable logic in an exaggerated, humorous way. Offer specific optimization suggestions using pseudo-code with omissions. For example:

        // // What sorcery is this? Did you code this while sleepwalking? Try something like:
        // // function doSomething() {
        // //   // Initialize...
        // //   for (let i = 0; i < someArray.length; i++) {
        // //     // Process logic...
        // //   }
        // //   // Return result...
        // // }

        // // Wow, this function is a maze! I need breadcrumbs to find my way out. Consider splitting:
        // // function part1() { /* ... */ }
        // // function part2() { /* ... */ }
        // // function mainFunction() {
        // //   part1();
        // //   part2();
        // //   // ...
        // // }

        // // Another mysterious variable name! Are you playing a guessing game? How about:
        // // let userInputValue = /* ... */;
        // // let processedResult = /* ... */;

        // // These nested loops are a masterpiece of Russian dolls! Are you trying to knit a sweater with code? Try:
        // // someArray.forEach(item => {
        // //   // Process single item...
        // // });

        // Do not modify the existing code other than the code comments;
        // Do not optimize the existing code other than the code comments;`,
        //           autoContext: false
        //         }
      ]

    return defaultExpertCodeEnhancerPromptList.map((item, index) => ({
      ...item,
      title: `✨ ${item.title}`,
      sort: 1000 + index
    }))
  }
