import DraggableFloatingNav from './DraggableFloatingNav';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>🎯 드래그 가능한 네비게이션 바</h1>
        <p>투명도와 블러 효과를 확인해보세요</p>
      </header>

      <div className="demo-container">
        <section className="demo-section">
          <div className="demo-info">
            <h2>특징</h2>
            <p>애플 스타일의 글래스모피즘 네비게이션 바입니다.</p>
            <ul className="demo-features">
              <li>✨ 투명한 배경</li>
              <li>🔥 블러 효과</li>
              <li>🎨 로고 색상 변화</li>
              <li>📱 모바일 최적화</li>
              <li>⚡ 고성능</li>
            </ul>
          </div>
        </section>

        <section className="demo-section">
          <div className="demo-info">
            <h2>사용 방법</h2>
            <p>하단의 네비게이션 바를 드래그하거나 클릭해보세요.</p>
            <ul className="demo-features">
              <li>🖱️ 드래그 가능</li>
              <li>👆 터치 지원</li>
              <li>🎯 스냅 기능</li>
            </ul>
          </div>
        </section>

        <section className="demo-section">
          <div className="demo-info">
            <h2>배경 확인용</h2>
            <p>이 섹션을 통해 네비게이션 바의 투명도를 확인할 수 있습니다.</p>
            <p style={{ fontSize: '14px', marginTop: '20px', lineHeight: '1.8' }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              네비게이션 바가 이 텍스트 위에 투명하게 표시됩니다.
            </p>
          </div>
        </section>
      </div>

      <DraggableFloatingNav />

      <footer className="app-footer">
        <p>© 2025 드래그 가능한 네비게이션 바</p>
      </footer>
    </div>
  );
}

export default App;