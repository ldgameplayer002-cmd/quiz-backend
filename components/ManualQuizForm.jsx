'use client';
import { useState, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';

export default function ManualQuizForm({ masterSchema, subject, onSave }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  
  const typesObj = masterSchema?.[subject]?.types || {};
  // Lọc bỏ bài học từ vựng (chỉ để lại các loại câu hỏi trắc nghiệm/bài tập)
  const schemaKeys = Object.keys(typesObj).filter(key => key !== 'VOCABULARY_EMOJI');
  
  // Make sure we have a valid selected type whenever subject changes
  const [selectedType, setSelectedType] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [activeEmojiPicker, setActiveEmojiPicker] = useState(null);

  // Clear toàn bộ data khi đổi môn học
  useEffect(() => {
    setQuestions([]);
    setTitle('');
    setDescription('');
  }, [subject]);
  
  useEffect(() => {
    if (schemaKeys.length > 0 && !schemaKeys.includes(selectedType)) {
      setSelectedType(schemaKeys[0]);
    }
  }, [schemaKeys, selectedType]);

  // Bỏ tính năng tự thêm câu hỏi mặc định theo yêu cầu của user
  const handleAddQuestion = () => {
    if (!selectedType || !typesObj[selectedType]) return;
    const newQuestion = { type: selectedType };
    
    // Determine fields
    const fieldsObj = typesObj[selectedType].fields || {};
    const fieldKeys = Object.keys(fieldsObj);

    fieldKeys.forEach(field => {
      newQuestion[field] = fieldsObj[field].type === 'number' ? 0 : '';
    });
    setQuestions([...questions, newQuestion]);
    setExpandedIndex(questions.length); // Mở câu hỏi vừa thêm
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({ title, description, questions });
  };

  const renderFieldInput = (qIndex, field, fieldSchema, value) => {
    const placeholder = fieldSchema.label || `Nhập ${field}`;
    
    // 1. Dạng Số (Number)
    if (fieldSchema.type === 'number') {
      return (
        <input 
          type="number" 
          className="premium-input" 
          value={value} 
          onChange={(e) => handleQuestionChange(qIndex, field, parseInt(e.target.value) || 0)} 
          placeholder={placeholder}
          style={{ marginBottom: '10px' }}
        />
      );
    }
    
    // 2. Dạng Dropdown (Select) - Ví dụ: Chọn Giọng đọc
    if (fieldSchema.type === 'select') {
      return (
        <select 
          className="premium-input" 
          value={value} 
          onChange={(e) => handleQuestionChange(qIndex, field, e.target.value)}
          style={{ marginBottom: '10px' }}
        >
          <option value="">-- Chọn {fieldSchema.label || field} --</option>
          {fieldSchema.options && fieldSchema.options.map(opt => {
            const optVal = opt.value || opt;
            const optLabel = opt.label || opt;
            return <option key={optVal} value={optVal}>{optLabel}</option>;
          })}
        </select>
      );
    }

    // 3. Dạng Emoji Text - Kèm theo bảng chọn Emoji
    if (fieldSchema.type === 'emoji_text') {
      const pickerId = `${qIndex}-${field}`;
      const isPickerOpen = activeEmojiPicker === pickerId;

      return (
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <textarea 
              className="premium-input" 
              value={value} 
              onChange={(e) => handleQuestionChange(qIndex, field, e.target.value)} 
              placeholder={placeholder}
              style={{ resize: 'vertical', minHeight: '50px' }}
            />
            <button 
              type="button"
              onClick={() => setActiveEmojiPicker(isPickerOpen ? null : pickerId)}
              style={{ padding: '0 15px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.15)', background: isPickerOpen ? 'var(--primary)' : 'rgba(255,255,255,0.9)', color: isPickerOpen ? 'white' : 'inherit', cursor: 'pointer', fontSize: '1.5rem', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
              title="Chèn Emoji"
            >
              😀
            </button>
          </div>
          
          {isPickerOpen && (
            <div style={{ position: 'absolute', top: '100%', right: '0', zIndex: 100, marginTop: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ background: '#fff', padding: '8px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Chọn Emoji (Nó sẽ tự thêm vào ô chữ)</span>
                <button onClick={() => setActiveEmojiPicker(null)} style={{ border: 'none', background: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 'bold' }}>Đóng X</button>
              </div>
              <EmojiPicker 
                onEmojiClick={(emojiData) => {
                  const prev = value || '';
                  handleQuestionChange(qIndex, field, prev + emojiData.emoji);
                }} 
                width={350}
                height={400}
                searchPlaceholder="Tìm kiếm emoji (ví dụ: apple, dog...)"
              />
            </div>
          )}
        </div>
      );
    }
    
    // 4. Dạng Văn bản thường (Mặc định)
    return (
      <textarea 
        className="premium-input" 
        value={value} 
        onChange={(e) => handleQuestionChange(qIndex, field, e.target.value)} 
        placeholder={placeholder}
        style={{ marginBottom: '10px', resize: 'vertical', minHeight: '40px' }}
      />
    );
  };

  if (!masterSchema || !masterSchema[subject]) {
    return <p>Đang tải cấu hình câu hỏi cho môn học này...</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease-in-out' }}>
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Thông tin chung của Đề</h3>
        <input type="text" className="premium-input" placeholder="Tiêu đề (VD: Bài tập cuối tuần)" value={title} onChange={e=>setTitle(e.target.value)} style={{ marginBottom: '10px' }} />
        <input type="text" className="premium-input" placeholder="Mô tả..." value={description} onChange={e=>setDescription(e.target.value)} />
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <select className="premium-input" value={selectedType} onChange={e=>setSelectedType(e.target.value)} style={{ flex: 1 }}>
          {schemaKeys.map(key => (
            <option key={key} value={key}>{typesObj[key].name} ({key})</option>
          ))}
        </select>
        <button className="premium-btn" onClick={handleAddQuestion}>+ Thêm Câu Hỏi</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {questions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '2px dashed rgba(79, 70, 229, 0.3)', borderRadius: '16px', background: 'rgba(255,255,255,0.5)' }}>
            <p style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1.1rem' }}>
              Bạn chưa tạo câu hỏi nào cho đề này.<br/>
              Hãy chọn khuôn mẫu ở phía trên và bấm nút <b style={{ color: 'var(--primary)' }}>+ Thêm Câu Hỏi</b> để bắt đầu soạn thảo nhé!
            </p>
          </div>
        )}
        {questions.map((q, qIndex) => {
          // Deep clone để override an toàn mà không ảnh hưởng state gốc
          const fieldsObj = JSON.parse(JSON.stringify(typesObj[q.type]?.fields || {}));
          
          // Tự động ép kiểu emoji_text cho các option của AUDIO_CHOICE (đỡ phải bắt user sửa trên Github)
          if (q.type === 'AUDIO_CHOICE') {
            if (fieldsObj.content) fieldsObj.content.type = 'emoji_text';
            if (fieldsObj.optionA) fieldsObj.optionA.type = 'emoji_text';
            if (fieldsObj.optionB) fieldsObj.optionB.type = 'emoji_text';
            if (fieldsObj.optionC) fieldsObj.optionC.type = 'emoji_text';
            if (fieldsObj.optionD) fieldsObj.optionD.type = 'emoji_text';
          }
          
          const fieldKeys = Object.keys(fieldsObj);
          const isExpanded = expandedIndex === qIndex;

          return (
            <div key={qIndex} className="glass-panel" style={{ padding: '1.2rem', borderLeft: isExpanded ? '4px solid var(--primary)' : '4px solid transparent', transition: 'all 0.3s ease', background: isExpanded ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.6)' }}>
              
              {/* ACCORDION HEADER */}
              <div 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setExpandedIndex(isExpanded ? -1 : qIndex)}
              >
                <h4 style={{ color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ background: isExpanded ? 'var(--primary)' : 'var(--text-muted)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.9rem', transition: 'background 0.3s' }}>
                    Câu {qIndex + 1}
                  </span> 
                  {typesObj[q.type]?.name || q.type}
                </h4>
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                    ▼
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRemoveQuestion(qIndex); }}
                    title="Xóa câu hỏi này"
                    style={{ background: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    X
                  </button>
                </div>
              </div>
              
              {/* ACCORDION BODY */}
              {isExpanded && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed rgba(0,0,0,0.1)', animation: 'fadeIn 0.3s ease-in-out' }}>
                  {fieldKeys.map(field => {
                    const fieldSchema = fieldsObj[field];
                    return (
                      <div key={field}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)' }}>
                          {fieldSchema.label} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '0.85rem' }}>({field})</span>
                        </label>
                        {renderFieldInput(qIndex, field, fieldSchema, q[field] ?? '')}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {questions.length > 0 && (
        <button className="premium-btn" style={{ width: '100%', marginTop: '1rem', background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)' }} onClick={handleSave}>
          Lưu Đề Lên Github ({questions.length} câu)
        </button>
      )}
    </div>
  );
}
