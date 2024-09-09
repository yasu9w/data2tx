import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // 次のレンダリングでフォールバックUIを表示するために状態を更新
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // エラーログを外部のエラーレポートサービスに送信することもできます
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // フォールバックUIをレンダリング
            return <h1>Something went wrong: {this.state.error.message}</h1>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
