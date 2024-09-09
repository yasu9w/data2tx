// src/pages/Tutorials.js
import React, { useEffect } from 'react';

const Tutorials = ({ language }) => {
    const texts = {
        en: {
            title: "Tutorials",
            intro: "This is an introductory paragraph explaining the purpose and structure of the tutorials.",
            step1: "Step 1: Setting Up Your Environment",
            step2: "Step 2: Creating Your First Project",
            step3: "Step 3: Deploying Your Project",
            content1: (
                <>
                    <p>In this step, you will set up your development environment. This includes installing necessary software, configuring your tools, and preparing your workspace.</p>

                    <p>Setting up the environment is crucial for a smooth development experience. You'll begin by installing a version control system like Git, followed by setting up Node.js, which is essential for most modern web development projects. Additionally, you'll configure a text editor or an Integrated Development Environment (IDE) like Visual Studio Code, which will help you write and manage your code efficiently.</p>

                    <p>Don't forget to configure version control to track your code changes, and learn how to push your initial setup to a remote repository, such as GitHub. These initial steps lay the groundwork for your entire project, ensuring that you have all the necessary tools and configurations in place before you start coding.</p>

                    <p>Moreover, understanding how to use the command line effectively can greatly enhance your productivity. While graphical user interfaces (GUIs) are useful, the command line offers a powerful, scriptable interface for interacting with your system. During this step, you should also familiarize yourself with basic shell commands, environment variables, and shell scripting to automate repetitive tasks.</p>

                    <p>Learning to navigate through your file system, manipulate files, and execute programs through the command line will provide you with a solid foundation in managing your development environment.</p>

                    <p>Another important aspect of setting up your environment is managing dependencies. Using tools like npm or yarn allows you to handle third-party libraries and packages effectively. You'll need to understand how to create and manage a package.json file, install dependencies, and handle versioning conflicts that may arise during development.</p>

                    <p>Additionally, setting up environment-specific configurations, such as different settings for development and production environments, will be critical as your project scales.</p>

                    <p>Finally, consider setting up automated workflows to streamline your development process. Tools like Git hooks, CI/CD pipelines, and automated testing frameworks can help ensure that your code remains clean, functional, and ready for deployment at any time. Establishing these practices early in your project will save you time and headaches down the line, making your development process more efficient and reliable.</p>
                </>
            ),
            content2: (
                <>
                    <p>Now that your environment is set up, it's time to create your first project. You'll learn how to initialize a new project using a framework or library of your choice, such as React, Vue, or Angular.</p>

                    <p>This step involves setting up the project structure, configuring package managers like npm or yarn, and installing essential dependencies. You'll also write your first lines of code to create a basic component or module, and understand how these components interact within your project.</p>

                    <p>As you build out your project, you'll explore key concepts such as state management, component lifecycle, and routing. By the end of this step, you should have a working prototype of your application that you can run locally and start iterating on.</p>

                    <p>As you dive deeper into your project, you'll encounter the need to manage application state effectively. Understanding state management is crucial for building scalable, maintainable applications. You might explore libraries like Redux or Vuex for managing global state, or learn about context and hooks in React for more localized state management.</p>

                    <p>Additionally, understanding how to structure your project files and organize your code into reusable components will be essential as your application grows in complexity.</p>

                    <p>Another key aspect of this step is setting up routing for your application. Most modern web applications are single-page applications (SPAs), where routing plays a critical role in navigating between different views or pages.</p>

                    <p>You'll learn how to set up routes, handle dynamic routing, and manage the navigation state in your application. Routing can also involve working with nested routes, lazy loading, and route guards to enhance the user experience and improve application performance.</p>

                    <p>Moreover, as your project progresses, you'll likely need to integrate with external APIs or services. Understanding how to make HTTP requests, handle asynchronous operations, and manage responses is vital.</p>

                    <p>You'll explore different techniques for data fetching, error handling, and working with RESTful APIs or GraphQL. Incorporating these external services into your project will enable you to build more dynamic, feature-rich applications that interact with real-world data.</p>
                </>
            ),
            content3: (
                <>
                    <p>Finally, you'll learn how to deploy your project to a live environment. This step covers building your project for production, deploying it to a server, and testing the live site.</p>

                    <p>You'll start by optimizing your code, minifying assets, and setting up environment variables for production. Next, you'll choose a hosting service, such as Netlify, Vercel, or AWS, and go through the process of deploying your application.</p>

                    <p>Once deployed, it's important to test the live site thoroughly to ensure that everything works as expected. You'll also learn about continuous deployment practices, which allow you to automatically deploy updates to your site whenever you push changes to your repository.</p>

                    <p>Deploying your project involves more than just uploading your files to a server. You'll need to consider various factors such as security, scalability, and performance optimization. Setting up HTTPS, configuring your server for load balancing, and implementing caching strategies are all crucial for maintaining a high-performance, secure application.</p>

                    <p>Additionally, monitoring your deployed application is essential for quickly identifying and resolving any issues that may arise. You'll learn about setting up monitoring tools, logging, and alert systems to keep your application running smoothly.</p>

                    <p>Moreover, you should familiarize yourself with the concept of infrastructure as code (IaC). Using tools like Terraform or AWS CloudFormation, you can automate the setup and management of your cloud infrastructure.</p>

                    <p>This approach not only makes your deployment process more efficient but also ensures that your infrastructure is consistent and reproducible across different environments.</p>

                    <p>Another important aspect of deployment is handling updates and rollbacks. Continuous Integration and Continuous Deployment (CI/CD) pipelines are essential for automating the deployment process and ensuring that new features or fixes are deployed smoothly.</p>

                    <p>You'll learn how to set up a CI/CD pipeline, integrate automated testing, and manage version control branches to facilitate a smooth deployment process.</p>

                    <p>Finally, post-deployment testing is critical. You'll need to conduct thorough testing to ensure that your application is functioning as expected in the live environment. This includes running performance tests, security audits, and usability tests to identify and fix any potential issues. Regularly updating and maintaining your application is also key to keeping it secure and performant.</p>
                </>
            ),
        },
        ja: {
            title: "チュートリアル",
            intro: "これは、チュートリアルの目的と構成を説明するための紹介文です。",
            step1: "手順 1: 開発環境のセットアップ",
            step2: "手順 2: 最初のプロジェクトを作成する",
            step3: "手順 3: プロジェクトをデプロイする",
            content1: (
                <>
                    <p>この手順では、開発環境をセットアップします。必要なソフトウェアのインストール、ツールの設定、作業スペースの準備を行います。</p>

                    <p>環境のセットアップは、スムーズな開発を行うための重要なステップです。Gitのようなバージョン管理システムをインストールし、次に、ほとんどの最新のWeb開発プロジェクトに必須のNode.jsを設定します。また、Visual Studio Codeのようなテキストエディタまたは統合開発環境（IDE）を設定して、コードを効率的に書いて管理できるようにします。</p>

                    <p>バージョン管理を設定してコードの変更を追跡し、初期セットアップをGitHubなどのリモートリポジトリにプッシュする方法も学びます。これらの初期ステップは、プロジェクト全体の基盤を築き、コーディングを開始する前に必要なすべてのツールと設定が整っていることを確認します。</p>

                    <p>さらに、コマンドラインの効果的な使用方法を理解することで、生産性を大幅に向上させることができます。グラフィカルユーザーインターフェイス（GUI）は便利ですが、コマンドラインはシステムと対話するための強力でスクリプト可能なインターフェイスを提供します。このステップでは、基本的なシェルコマンド、環境変数、およびシェルスクリプトを習得して、繰り返し作業を自動化する方法を学びます。</p>

                    <p>ファイルシステムをナビゲートし、ファイルを操作し、プログラムを実行する方法をコマンドラインで学ぶことで、開発環境の管理において堅固な基盤を築くことができます。</p>

                    <p>開発環境をセットアップするもう一つの重要な側面は、依存関係の管理です。npmやyarnなどのツールを使用して、サードパーティのライブラリやパッケージを効果的に扱う方法を学びます。package.jsonファイルを作成および管理し、依存関係をインストールし、開発中に発生する可能性のあるバージョンの競合を処理する方法を理解する必要があります。</p>

                    <p>さらに、開発環境と本番環境で異なる設定をするなど、環境固有の構成を設定することは、プロジェクトが拡大するにつれて重要になります。</p>

                    <p>最後に、開発プロセスを合理化するために自動化されたワークフローを設定することを検討してください。Gitフック、CI/CDパイプライン、自動テストフレームワークなどのツールを使用すると、コードが常にクリーンで機能的であり、いつでもデプロイできる状態に保つことができます。プロジェクトの早い段階でこれらの実践を確立することで、将来的な時間と手間を節約し、開発プロセスをより効率的で信頼性の高いものにすることができます。</p>
                </>
            ),
            content2: (
                <>
                    <p>環境が整ったら、最初のプロジェクトを作成しましょう。React、Vue、またはAngularなど、選択したフレームワークやライブラリを使用して、新しいプロジェクトを初期化する方法を学びます。</p>

                    <p>このステップでは、プロジェクトの構造を設定し、npmやyarnのようなパッケージマネージャーを設定し、必要な依存関係をインストールします。また、最初のコードを書いて、基本的なコンポーネントやモジュールを作成し、これらのコンポーネントがプロジェクト内でどのように相互作用するかを理解します。</p>

                    <p>プロジェクトを構築していく中で、状態管理、コンポーネントのライフサイクル、およびルーティングなどの重要な概念を探ります。このステップが終わる頃には、ローカルで実行できるアプリケーションのプロトタイプが完成し、さらに改良を加えていく準備が整います。</p>

                    <p>プロジェクトが進行するにつれて、アプリケーションの状態を効果的に管理する必要が出てきます。状態管理を理解することは、スケーラブルで保守可能なアプリケーションを構築するために不可欠です。ReduxやVuexなどのライブラリを使用してグローバルな状態を管理する方法を探るか、Reactのコンテキストやフックを使用して、よりローカライズされた状態管理を学びます。</p>

                    <p>さらに、プロジェクトファイルの構造化方法やコードを再利用可能なコンポーネントに整理する方法を理解することは、アプリケーションが複雑さを増すにつれて重要になります。</p>

                    <p>このステップのもう一つの重要な側面は、アプリケーションのルーティング設定です。ほとんどの最新のWebアプリケーションはシングルページアプリケーション（SPA）であり、ルーティングは異なるビューやページ間のナビゲーションにおいて重要な役割を果たします。</p>

                    <p>ルートを設定し、動的ルーティングを処理し、アプリケーションのナビゲーション状態を管理する方法を学びます。ルーティングには、ネストされたルート、遅延読み込み、ルートガードなどを扱うことも含まれ、ユーザーエクスペリエンスを向上させ、アプリケーションのパフォーマンスを改善します。</p>

                    <p>さらに、プロジェクトが進行するにつれて、外部APIやサービスと統合する必要が出てきます。HTTPリクエストの作成、非同期操作の処理、応答の管理を理解することが重要です。</p>

                    <p>データの取得、エラーハンドリング、RESTful APIやGraphQLの使用方法など、さまざまなテクニックを探ります。これらの外部サービスをプロジェクトに組み込むことで、実際のデータとやり取りする、より動的で機能豊富なアプリケーションを構築できるようになります。</p>
                </>
            ),
            content3: (
                <>
                    <p>最後に、プロジェクトをライブ環境にデプロイする方法を学びます。このステップでは、プロジェクトを本番環境向けにビルドし、サーバーにデプロイし、ライブサイトをテストする方法をカバーします。</p>

                    <p>まず、コードを最適化し、アセットを最小化し、本番環境用の環境変数を設定します。次に、Netlify、Vercel、またはAWSのようなホスティングサービスを選び、アプリケーションをデプロイするプロセスを進めます。</p>

                    <p>デプロイが完了したら、ライブサイトを徹底的にテストして、すべてが期待どおりに動作していることを確認します。継続的デプロイメントの手法についても学び、リポジトリに変更をプッシュするたびに自動的にサイトに更新がデプロイされるようにします。</p>

                    <p>プロジェクトのデプロイは、単にファイルをサーバーにアップロードするだけではありません。セキュリティ、スケーラビリティ、およびパフォーマンスの最適化など、さまざまな要因を考慮する必要があります。HTTPSの設定、ロードバランシングのためのサーバー設定、およびキャッシュ戦略の実装は、高パフォーマンスでセキュアなアプリケーションを維持するために重要です。</p>

                    <p>さらに、デプロイされたアプリケーションを監視することは、発生する可能性のある問題を迅速に特定して解決するために不可欠です。監視ツールの設定、ログの管理、およびアラートシステムの設定について学び、アプリケーションがスムーズに動作するようにします。</p>

                    <p>また、インフラストラクチャをコードとして管理する概念にも慣れておく必要があります。TerraformやAWS CloudFormationなどのツールを使用して、クラウドインフラストラクチャのセットアップと管理を自動化できます。</p>

                    <p>このアプローチにより、デプロイメントプロセスがより効率的になり、インフラストラクチャが一貫しており、さまざまな環境で再現可能であることが保証されます。</p>

                    <p>デプロイメントのもう一つの重要な側面は、更新とロールバックの処理です。継続的インテグレーションおよび継続的デプロイメント（CI/CD）パイプラインは、デプロイメントプロセスを自動化し、新機能や修正をスムーズにデプロイするために不可欠です。</p>

                    <p>CI/CDパイプラインの設定、自動テストの統合、およびバージョン管理ブランチの管理方法を学び、スムーズなデプロイメントプロセスを実現します。</p>

                    <p>最後に、デプロイ後のテストは非常に重要です。ライブ環境でアプリケーションが期待どおりに動作していることを確認するために、徹底的なテストを実行する必要があります。パフォーマンステスト、セキュリティ監査、およびユーザビリティテストを実行して、潜在的な問題を特定して修正します。</p>
                </>
            ),
        },
    };

    const t = texts[language]; // 現在の言語に応じて表示するテキストを切り替える

    // Scroll to top when the component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []); // Empty dependency array ensures this runs only on mount

    return (
        <div style={styles.container}>
            <h1>{t.title}</h1>
            <p>{t.intro}</p> {/* ここに文章を追加します */}
            <h2 id="step1">{t.step1}</h2>
            <p>{t.content1}</p>
            <h2 id="step2">{t.step2}</h2>
            <p>{t.content2}</p>
            <h2 id="step3">{t.step3}</h2>
            <p>{t.content3}</p>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
    },
};

export default Tutorials;