import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './DraggableFloatingNav.css';

function DraggableFloatingNav() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [indicatorPos, setIndicatorPos] = useState({ left: 0, width: 0 });
  const [hoveredItems, setHoveredItems] = useState([]);

  const navContainerRef = useRef(null);
  const navRefs = useRef([]);
  const indicatorRef = useRef(null);
  const rafRef = useRef(null);

  const navItems = useMemo(() => [
    { name: '홈', icon: '🏠' },
    { name: '학교소개', icon: '🏫' },
    { name: '학사일정', icon: '📅' },
    { name: '급식', icon: '🍱' },
    { name: '공지사항', icon: '📢' }
  ], []);

  // 로고 스타일 계산 (인라인 스타일을 함수로 분리)
  const getLogoStyle = useCallback((isActive, overlapRatio, enhancedRatio) => {
    if (isActive) {
      return {
        opacity: 1,
        filter: 'grayscale(0%) brightness(1.1)',
        transform: 'scale(1.2)'
      };
    }

    return {
      opacity: Math.max(0.4, 0.4 + enhancedRatio * 0.6),
      filter: `grayscale(${Math.max(0, 100 - enhancedRatio * 120)}%) brightness(${0.8 + enhancedRatio * 0.4})`,
      transform: overlapRatio > 0
        ? `scale(${1 + enhancedRatio * 0.25})`
        : 'scale(1)'
    };
  }, []);

  // 인디케이터와 겹치는 항목들 계산 (requestAnimationFrame으로 최적화)
  const calculateOverlappingItems = useCallback((indicatorLeft, indicatorWidth) => {
    // 이전 프레임 취소
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const indicatorRight = indicatorLeft + indicatorWidth;

      const overlapping = navRefs.current
        .map((element, index) => ({ element, index }))
        .filter(({ element }) => element)
        .map(({ element, index }) => {
          const itemLeft = element.offsetLeft;
          const itemRight = itemLeft + element.offsetWidth;
          const overlapStart = Math.max(indicatorLeft, itemLeft);
          const overlapEnd = Math.min(indicatorRight, itemRight);
          const overlapWidth = Math.max(0, overlapEnd - overlapStart);
          const overlapRatio = overlapWidth / element.offsetWidth;

          return { index, ratio: overlapRatio, overlapWidth };
        })
        .filter(({ overlapWidth }) => overlapWidth > 0)
        .map(({ index, ratio }) => ({ index, ratio }));

      setHoveredItems(overlapping);
    });
  }, []);

  // 인디케이터 위치 업데이트
  const updateIndicatorPosition = useCallback((index) => {
    const element = navRefs.current[index];
    if (element) {
      const newPos = {
        left: element.offsetLeft,
        width: element.offsetWidth
      };
      setIndicatorPos(newPos);
      calculateOverlappingItems(newPos.left, newPos.width);
    }
  }, [calculateOverlappingItems]);

  // 현재 마우스/터치 위치에서 가장 가까운 항목 찾기
  const findNearestItem = useCallback((xPosition) => {
    const container = navContainerRef.current;
    if (!container) return activeIndex;

    const containerRect = container.getBoundingClientRect();
    const relativeX = xPosition - containerRect.left;

    const distances = navRefs.current
      .map((element, index) => ({ element, index }))
      .filter(({ element }) => element)
      .map(({ element, index }) => ({
        index,
        distance: Math.abs(relativeX - (element.offsetLeft + element.offsetWidth / 2))
      }));

    if (distances.length === 0) return activeIndex;

    return distances.reduce((nearest, current) =>
      current.distance < nearest.distance ? current : nearest
    ).index;
  }, [activeIndex]);

  // 마우스 드래그 시작
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // 터치 드래그 시작
  const handleTouchStart = (e) => {
    setIsDragging(true);
  };

  // 드래그 중
  const handleMove = (clientX) => {
    if (!isDragging) return;

    const container = navContainerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const relativeX = clientX - containerRect.left;

    const indicatorWidth = indicatorPos.width;
    let newLeft = relativeX - indicatorWidth / 2;

    const maxLeft = container.offsetWidth - indicatorWidth;
    newLeft = Math.max(0, Math.min(newLeft, maxLeft));

    setIndicatorPos(prev => ({
      ...prev,
      left: newLeft
    }));

    // 드래그 중 겹치는 항목 계산
    calculateOverlappingItems(newLeft, indicatorWidth);
  };

  // 마우스 이동
  const handleMouseMove = (e) => {
    if (!isDragging) return;

    e.preventDefault();
    handleMove(e.clientX);
  };

  // 터치 이동
  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const hasTouchPoints = e.touches?.length > 0;
    if (!hasTouchPoints) return;

    handleMove(e.touches[0].clientX);
  };

  // 드래그 종료
  const handleDragEnd = (clientX) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    const nearestIndex = findNearestItem(clientX);
    setActiveIndex(nearestIndex);
    updateIndicatorPosition(nearestIndex);
  };

  // 마우스 드래그 종료
  const handleMouseUp = (e) => {
    handleDragEnd(e.clientX);
  };

  // 터치 드래그 종료
  const handleTouchEnd = (e) => {
    const hasChangedTouches = e.changedTouches?.length > 0;
    if (!hasChangedTouches) return;

    handleDragEnd(e.changedTouches[0].clientX);
  };

  // 항목 클릭
  const handleItemClick = (index) => {
    if (isDragging) return;

    setActiveIndex(index);
    updateIndicatorPosition(index);
  };

  // 초기 위치 설정
  useEffect(() => {
    updateIndicatorPosition(activeIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // activeIndex 변경 시 위치 업데이트
  useEffect(() => {
    if (!isDragging) {
      updateIndicatorPosition(activeIndex);
    }
  }, [activeIndex, isDragging, updateIndicatorPosition]);

  // 리사이즈 대응
  useEffect(() => {
    const handleResize = () => {
      updateIndicatorPosition(activeIndex);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeIndex, updateIndicatorPosition]);

  // cleanup: 컴포넌트 언마운트 시 RAF 취소
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // 전역 이벤트 리스너
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, indicatorPos]);

  return (
    <div className="draggable-nav-wrapper">
      <nav className="draggable-floating-nav">
        <div className="nav-container" ref={navContainerRef}>
          {/* 애플 리퀴드 글래스 인디케이터 */}
          <div 
            ref={indicatorRef}
            className={`floating-indicator ${isDragging ? 'dragging' : ''}`}
            style={{
              left: `${indicatorPos.left}px`,
              width: `${indicatorPos.width}px`,
              transition: isDragging ? 'none' : 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {/* 리퀴드 레이어들 */}
            <div className="liquid-layer liquid-layer-1"></div>
            <div className="liquid-layer liquid-layer-2"></div>
          </div>
          
          {/* 네비게이션 항목들 */}
          {navItems.map((item, index) => {
            const overlappingItem = hoveredItems.find(h => h.index === index);
            const overlapRatio = overlappingItem?.ratio ?? 0;
            const isActive = index === activeIndex;
            const enhancedRatio = Math.pow(overlapRatio, 0.4);
            const logoStyle = getLogoStyle(isActive, overlapRatio, enhancedRatio);

            return (
              <button
                key={item.name}
                ref={(el) => (navRefs.current[index] = el)}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleItemClick(index)}
              >
                <span className="nav-item-content">
                  <span className="nav-item-logo" style={logoStyle}>
                    {item.icon}
                  </span>
                  <span className="nav-item-text">{item.name}</span>
                </span>
              </button>
            );
          })}
        </div>
      </nav>
      
      {isDragging && <div className="drag-overlay" />}
    </div>
  );
}

export default DraggableFloatingNav;