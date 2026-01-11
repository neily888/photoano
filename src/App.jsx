import React, { useState, useRef, useEffect } from 'react';
import { Camera, Undo, Redo, Download, ArrowRight, Circle, Square, Type, Search, Minus, X, RotateCw, Palette, Droplet, Layers } from 'lucide-react';

const PhotoAnnotator = () => {
  const [image, setImage] = useState(null);
  const [objects, setObjects] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loupeMode, setLoupeMode] = useState(false);
  const [loupePos, setLoupePos] = useState(null);
  const [currentColor, setCurrentColor] = useState('#FF3B30');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [canvasScale, setCanvasScale] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState(null);
  
  const canvasRef = useRef(null);
  const loupeCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);

  const colors = [
    { name: 'Red', value: '#FF3B30' },
    { name: 'Yellow', value: '#FFCC00' },
    { name: 'Green', value: '#34C759' },
    { name: 'Blue', value: '#007AFF' },
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Orange', value: '#FF9500' },
    { name: 'Purple', value: '#AF52DE' }
  ];

  const tools = [
    { id: 'arrow', icon: ArrowRight, name: 'Arrow' },
    { id: 'curved-arrow', icon: ArrowRight, name: 'Curved Arrow' },
    { id: 'line', icon: Minus, name: 'Line' },
    { id: 'rectangle', icon: Square, name: 'Rectangle' },
    { id: 'circle', icon: Circle, name: 'Circle' },
    { id: 'text', icon: Type, name: 'Text' },
    { id: 'loupe', icon: Search, name: 'Loupe' }
  ];

  const fontSizes = [14, 18, 24, 32, 48];
  const loupeZoomLevels = [2, 3, 4];
  const lineWidths = [2, 4, 6, 8, 10];

  useEffect(() => {
    if (image && canvasRef.current) {
      drawCanvas();
    }
  }, [objects, image, canvasScale, canvasOffset, selectedObject]);

  useEffect(() => {
    if (loupeMode && loupePos && image) {
      drawLoupe();
    }
  }, [loupePos, loupeMode]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          setImage(img);
          const canvas = canvasRef.current;
          const container = canvas.parentElement;
          
          // Set canvas to actual image dimensions
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Calculate scale to fit container
          const containerWidth = container.clientWidth - 32; // padding
          const containerHeight = container.clientHeight - 32;
          const scaleX = containerWidth / img.width;
          const scaleY = containerHeight / img.height;
          const scale = Math.min(scaleX, scaleY, 1);
          
          setCanvasScale(scale);
          drawCanvas();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    objects.forEach((obj, index) => {
      const isSelected = selectedObject === index;
      drawObject(ctx, obj, isSelected);
    });
  };

  const drawObject = (ctx, obj, isSelected) => {
    ctx.save();
    
    // Apply rotation
    if (obj.rotation) {
      const centerX = obj.x + (obj.width || 0) / 2;
      const centerY = obj.y + (obj.height || 0) / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((obj.rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }

    ctx.strokeStyle = obj.color;
    ctx.fillStyle = obj.color;
    ctx.lineWidth = obj.lineWidth || 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (obj.type) {
      case 'arrow':
      case 'curved-arrow':
        drawArrow(ctx, obj);
        break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(obj.x, obj.y);
        ctx.lineTo(obj.endX, obj.endY);
        ctx.stroke();
        break;
      case 'rectangle':
        if (obj.filled) {
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        } else {
          ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
        }
        break;
      case 'circle':
        ctx.beginPath();
        ctx.ellipse(
          obj.x + obj.width / 2,
          obj.y + obj.height / 2,
          Math.abs(obj.width / 2),
          Math.abs(obj.height / 2),
          0, 0, 2 * Math.PI
        );
        if (obj.filled) {
          ctx.fill();
        } else {
          ctx.stroke();
        }
        break;
      case 'text':
        ctx.font = `${obj.fontSize || 24}px "SF Pro Display", -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const metrics = ctx.measureText(obj.text);
        const textWidth = metrics.width;
        const textHeight = obj.fontSize || 24;
        const padding = 8;
        
        if (obj.background !== 'transparent') {
          ctx.fillStyle = obj.background || 'white';
          ctx.fillRect(
            obj.x - textWidth / 2 - padding,
            obj.y - textHeight / 2 - padding,
            textWidth + padding * 2,
            textHeight + padding * 2
          );
        }
        
        ctx.fillStyle = obj.color;
        ctx.fillText(obj.text, obj.x, obj.y);
        break;
      case 'loupe':
        drawStaticLoupe(ctx, obj);
        break;
    }

    // Draw selection handles
    if (isSelected) {
      drawSelectionHandles(ctx, obj);
    }

    ctx.restore();
  };

  const drawArrow = (ctx, obj) => {
    const { x, y, endX, endY, arrowHeads = 'end', curveControl } = obj;
    
    ctx.beginPath();
    if (curveControl && obj.type === 'curved-arrow') {
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(curveControl.x, curveControl.y, endX, endY);
    } else {
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
    }
    ctx.stroke();

    const arrowLength = Math.sqrt((endX - x) ** 2 + (endY - y) ** 2);
    const headSize = Math.min(arrowLength * 0.15, 20);

    if (arrowHeads === 'end' || arrowHeads === 'both') {
      drawArrowHead(ctx, endX, endY, x, y, headSize);
    }
    if (arrowHeads === 'start' || arrowHeads === 'both') {
      drawArrowHead(ctx, x, y, endX, endY, headSize);
    }
  };

  const drawArrowHead = (ctx, tipX, tipY, fromX, fromY, size) => {
    const angle = Math.atan2(tipY - fromY, tipX - fromX);
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(
      tipX - size * Math.cos(angle - Math.PI / 6),
      tipY - size * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(
      tipX - size * Math.cos(angle + Math.PI / 6),
      tipY - size * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const drawStaticLoupe = (ctx, obj) => {
    const { x, y, size = 80, zoom = 2 } = obj;
    const radius = size / 2;
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.clip();
    
    const sourceSize = size / zoom;
    ctx.drawImage(
      image,
      x - sourceSize / 2, y - sourceSize / 2, sourceSize, sourceSize,
      x - radius, y - radius, size, size
    );
    
    ctx.restore();
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const drawLoupe = () => {
    const loupeCanvas = loupeCanvasRef.current;
    if (!loupeCanvas || !loupePos || !image) return;
    
    const ctx = loupeCanvas.getContext('2d');
    const size = 120;
    const zoom = 3;
    const radius = size / 2;
    
    loupeCanvas.width = size;
    loupeCanvas.height = size;
    
    ctx.clearRect(0, 0, size, size);
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
    ctx.clip();
    
    const sourceSize = size / zoom;
    ctx.drawImage(
      image,
      loupePos.x - sourceSize / 2, loupePos.y - sourceSize / 2, sourceSize, sourceSize,
      0, 0, size, size
    );
    
    ctx.restore();
    
    ctx.strokeStyle = '#007AFF';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const drawSelectionHandles = (ctx, obj) => {
    ctx.fillStyle = '#007AFF';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    
    const handles = getObjectHandles(obj);
    handles.forEach(handle => {
      ctx.beginPath();
      ctx.arc(handle.x, handle.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    });
  };

  const getObjectHandles = (obj) => {
    const handles = [];
    
    if (obj.type === 'arrow' || obj.type === 'curved-arrow' || obj.type === 'line') {
      handles.push({ x: obj.x, y: obj.y, type: 'start' });
      handles.push({ x: obj.endX, y: obj.endY, type: 'end' });
      if (obj.type === 'curved-arrow' && obj.curveControl) {
        handles.push({ x: obj.curveControl.x, y: obj.curveControl.y, type: 'curve' });
      }
    } else if (obj.type === 'rectangle' || obj.type === 'circle') {
      const { x, y, width, height } = obj;
      handles.push({ x, y, type: 'nw' });
      handles.push({ x: x + width, y, type: 'ne' });
      handles.push({ x: x + width, y: y + height, type: 'se' });
      handles.push({ x, y: y + height, type: 'sw' });
    } else if (obj.type === 'text' || obj.type === 'loupe') {
      handles.push({ x: obj.x, y: obj.y, type: 'center' });
    }
    
    return handles;
  };

  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    
    return {
      x: (touch.clientX - rect.left) / canvasScale,
      y: (touch.clientY - rect.top) / canvasScale
    };
  };

  const handleCanvasMouseDown = (e) => {
    e.preventDefault();
    const point = getCanvasPoint(e);
    
    if (e.touches && e.touches.length === 2) {
      setIsPanning(true);
      return;
    }

    if (loupeMode) {
      setLoupePos(point);
      return;
    }

    // Check if clicking on an object
    const clickedIndex = findObjectAt(point);
    if (clickedIndex !== -1) {
      setSelectedObject(clickedIndex);
      setIsDrawing(false);
      return;
    }

    setSelectedObject(null);
    
    if (!selectedTool) return;

    setIsDrawing(true);
    const newObj = {
      type: selectedTool,
      x: point.x,
      y: point.y,
      color: currentColor,
      lineWidth: 4,
      rotation: 0
    };

    if (selectedTool === 'text') {
      const text = prompt('Enter text:');
      if (!text) {
        setIsDrawing(false);
        return;
      }
      newObj.text = text;
      newObj.fontSize = 24;
      newObj.background = 'transparent';
      addObject(newObj);
      setIsDrawing(false);
    } else if (selectedTool === 'loupe') {
      newObj.size = 80;
      newObj.zoom = 2;
      // Loupe will be added when finger lifts in loupeMode
    } else if (selectedTool === 'arrow' || selectedTool === 'curved-arrow' || selectedTool === 'line') {
      newObj.endX = point.x;
      newObj.endY = point.y;
      newObj.arrowHeads = selectedTool === 'line' ? 'none' : 'end';
      if (selectedTool === 'curved-arrow') {
        newObj.curveControl = { x: point.x, y: point.y };
      }
      setObjects([...objects, newObj]);
    } else {
      newObj.width = 0;
      newObj.height = 0;
      newObj.filled = false;
      setObjects([...objects, newObj]);
    }
  };

  const handleCanvasMouseMove = (e) => {
    e.preventDefault();
    const point = getCanvasPoint(e);

    if (loupeMode) {
      setLoupePos(point);
      return;
    }

    if (!isDrawing) return;

    const newObjects = [...objects];
    const currentObj = newObjects[newObjects.length - 1];

    if (selectedTool === 'arrow' || selectedTool === 'curved-arrow' || selectedTool === 'line') {
      currentObj.endX = point.x;
      currentObj.endY = point.y;
      
      if (selectedTool === 'curved-arrow' && !currentObj.curveControl) {
        currentObj.curveControl = {
          x: (currentObj.x + point.x) / 2,
          y: (currentObj.y + point.y) / 2
        };
      }
    } else {
      currentObj.width = point.x - currentObj.x;
      currentObj.height = point.y - currentObj.y;
    }

    setObjects(newObjects);
  };

  const handleCanvasMouseUp = (e) => {
    if (loupeMode && loupePos) {
      const loupeObj = {
        type: 'loupe',
        x: loupePos.x,
        y: loupePos.y,
        size: 80,
        zoom: 2,
        color: currentColor,
        rotation: 0
      };
      addObject(loupeObj);
      setLoupeMode(false);
      setLoupePos(null);
      setSelectedTool(null);
      return;
    }

    if (isDrawing) {
      addToHistory();
    }
    setIsDrawing(false);
  };

  const findObjectAt = (point) => {
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      if (isPointInObject(point, obj)) {
        return i;
      }
    }
    return -1;
  };

  const isPointInObject = (point, obj) => {
    if (obj.type === 'rectangle' || obj.type === 'circle') {
      return point.x >= obj.x && point.x <= obj.x + obj.width &&
             point.y >= obj.y && point.y <= obj.y + obj.height;
    } else if (obj.type === 'text' || obj.type === 'loupe') {
      const dist = Math.sqrt((point.x - obj.x) ** 2 + (point.y - obj.y) ** 2);
      return dist < 30;
    }
    return false;
  };

  const addObject = (obj) => {
    setObjects([...objects, obj]);
    addToHistory();
  };

  const addToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...objects]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setObjects(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setObjects(history[historyIndex + 1]);
    }
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `annotated-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const deleteSelected = () => {
    if (selectedObject !== null) {
      const newObjects = objects.filter((_, i) => i !== selectedObject);
      setObjects(newObjects);
      setSelectedObject(null);
      addToHistory();
    }
  };

  const updateSelectedObject = (updates) => {
    if (selectedObject !== null) {
      const newObjects = [...objects];
      newObjects[selectedObject] = { ...newObjects[selectedObject], ...updates };
      setObjects(newObjects);
    }
  };

  if (!image) {
    return (
      <div className="app-container">
        <div className="upload-screen">
          <div className="upload-content">
            <Camera size={64} strokeWidth={1.5} />
            <h1>Photo Annotator</h1>
            <p>Upload a photo to start annotating</p>
            <button 
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose Photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>
        </div>
        <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app-container {
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
          overflow: hidden;
        }

        .upload-screen {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .upload-content {
          text-align: center;
          animation: fadeIn 0.6s ease-out;
        }

        .upload-content svg {
          color: #007AFF;
          margin-bottom: 2rem;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .upload-content h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          letter-spacing: -0.5px;
        }

        .upload-content p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 2rem;
          font-size: 0.95rem;
        }

        .upload-btn {
          background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
          color: white;
          border: none;
          padding: 1rem 2.5rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
        }

        .upload-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(0, 122, 255, 0.4);
        }

        .upload-btn:active {
          transform: translateY(0);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      </div>
    );
  }

  return (
    <div className="app-container">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
      
      {/* Top Bar */}
      <div className="top-bar">
        <button className="icon-btn" onClick={saveImage} title="Save">
          <Download size={20} />
        </button>
        <div className="spacer" />
        <button 
          className="icon-btn" 
          onClick={undo} 
          disabled={historyIndex === 0}
          title="Undo"
        >
          <Undo size={20} />
        </button>
        <button 
          className="icon-btn" 
          onClick={redo} 
          disabled={historyIndex === history.length - 1}
          title="Redo"
        >
          <Redo size={20} />
        </button>
      </div>

      {/* Canvas Container */}
      <div className="canvas-container">
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <canvas
            ref={canvasRef}
            style={{ 
              transform: `scale(${canvasScale})`,
              transformOrigin: 'top left',
              touchAction: 'none',
              cursor: loupeMode ? 'crosshair' : 'default'
            }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onTouchStart={handleCanvasMouseDown}
            onTouchMove={handleCanvasMouseMove}
            onTouchEnd={handleCanvasMouseUp}
          />
          
          {loupeMode && loupePos && (
            <canvas
              ref={loupeCanvasRef}
              className="loupe-overlay"
              style={{
                left: loupePos.x * canvasScale - 60,
                top: loupePos.y * canvasScale - 60
              }}
            />
          )}
        </div>
      </div>

      {/* Tool Bar */}
      <div className="tool-bar">
        {tools.map(tool => (
          <button
            key={tool.id}
            className={`tool-btn ${selectedTool === tool.id ? 'active' : ''}`}
            onClick={() => {
              if (tool.id === 'loupe') {
                setLoupeMode(true);
                setSelectedTool('loupe');
              } else {
                setSelectedTool(tool.id);
                setLoupeMode(false);
              }
            }}
            title={tool.name}
          >
            <tool.icon size={20} />
          </button>
        ))}
      </div>

      {/* Properties Panel */}
      {selectedObject !== null && (
        <div className="properties-panel">
          <div className="prop-group">
            <button 
              className="prop-btn"
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              <Palette size={18} />
            </button>
            
            {objects[selectedObject].type !== 'text' && objects[selectedObject].type !== 'loupe' && (
              <button 
                className="prop-btn"
                onClick={() => updateSelectedObject({ 
                  filled: !objects[selectedObject].filled 
                })}
                title="Toggle Fill"
              >
                <Droplet size={18} fill={objects[selectedObject].filled ? 'currentColor' : 'none'} />
              </button>
            )}
            
            <button 
              className="prop-btn"
              onClick={deleteSelected}
              title="Delete"
            >
              <X size={18} />
            </button>
          </div>
          
          {showColorPicker && (
            <div className="color-picker">
              {colors.map(c => (
                <button
                  key={c.value}
                  className="color-swatch"
                  style={{ 
                    backgroundColor: c.value,
                    border: c.value === '#FFFFFF' ? '1px solid #ddd' : 'none'
                  }}
                  onClick={() => {
                    updateSelectedObject({ color: c.value });
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app-container {
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
          overflow: hidden;
        }

        .top-bar {
          display: flex;
          align-items: center;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .spacer {
          flex: 1;
        }

        .icon-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-left: 0.5rem;
        }

        .icon-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        .icon-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .canvas-container {
          flex: 1;
          overflow: auto;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 1rem;
          -webkit-overflow-scrolling: touch;
        }

        .loupe-overlay {
          position: absolute;
          pointer-events: none;
          z-index: 1000;
          border-radius: 50%;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .tool-bar {
          display: flex;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .tool-btn {
          min-width: 50px;
          height: 50px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tool-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .tool-btn.active {
          background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
          border-color: #007AFF;
          box-shadow: 0 4px 16px rgba(0, 122, 255, 0.4);
        }

        .properties-panel {
          position: fixed;
          bottom: 90px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(20px);
          padding: 0.75rem;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .prop-group {
          display: flex;
          gap: 0.5rem;
        }

        .prop-btn {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .prop-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .color-picker {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .color-swatch {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .color-swatch:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 768px) {
          .tool-bar {
            padding: 0.75rem;
          }
          
          .tool-btn {
            min-width: 44px;
            height: 44px;
          }
        }
      `}</style>
    </div>
  );
};

export default PhotoAnnotator;
