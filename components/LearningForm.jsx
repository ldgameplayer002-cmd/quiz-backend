'use client';
import { useState, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';

export default function LearningForm({ subject, onSave, initialData, readOnly }) {
  const [title, setTitle] = useState('');
  const [rewardPoints, setRewardPoints] = useState(20);
  const [words, setWords] = useState([]);
  const [activeEmojiPicker, setActiveEmojiPicker] = useState(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setRewardPoints(initialData.rewardPoints || 20);
      setWords(initialData.words || []);
    } else {
      setWords([]);
      setTitle('');
      setRewardPoints(20);
    }
  }, [subject, initialData]);

  const handleAddWord = () => {
    setWords([...words, { word: '', meaning: '', emoji: '' }]);
  };

  const handleWordChange = (index, field, value) => {
    const updated = [...words];
    updated[index][field] = value;
    setWords(updated);
  };

  const handleRemoveWord = (index) => {
    setWords(words.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề bài học!");
      return;
    }
    // Lọc bỏ những từ trống
    const validWords = words.filter(w => w.word.trim() !== '');
    if (validWords.length === 0) {
      alert("Vui lòng nhập ít nhất 1 từ vựng!");
      return;
    }
    onSave({ title, rewardPoints, words: validWords });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease-in-out' }}>
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(254, 242, 242, 0.8)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>📌 Thông tin Bài Học</h3>
        <input 
          type="text" 
          className="premium-input" 
          placeholder="Tiêu đề bài học (VD: Từ vựng các con vật)" 
          value={title} 
          onChange={e=>setTitle(e.target.value)} 
          style={{ marginBottom: '10px' }}
          disabled={readOnly}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: '600', color: 'var(--text-main)', minWidth: '120px' }}>Điểm thưởng:</label>
          <input 
            type="number" 
            className="premium-input" 
            placeholder="20" 
            value={rewardPoints} 
            onChange={e=>setRewardPoints(Number(e.target.value))} 
            style={{ width: '100px', marginBottom: '0' }} 
            disabled={readOnly}
          />
        </div>
      </div>

      {!readOnly && (
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button className="premium-btn" style={{ background: 'var(--secondary)', width: '100%' }} onClick={handleAddWord}>
          + Thêm Từ Vựng Mới
        </button>
      </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {words.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '2px dashed rgba(236, 72, 153, 0.3)', borderRadius: '16px', background: 'rgba(255,255,255,0.5)' }}>
            <p style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1.1rem' }}>
              Chưa có từ vựng nào.<br/>
              Bấm nút <b style={{ color: 'var(--secondary)' }}>+ Thêm Từ Vựng Mới</b> để bắt đầu nhé!
            </p>
          </div>
        )}
        
        {words.map((item, index) => {
          const isPickerOpen = activeEmojiPicker === index;

          return (
            <div key={index} className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--secondary)', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: 'var(--secondary)', margin: 0 }}>Từ vựng {index + 1}</h4>
                {!readOnly && (
                <button 
                  onClick={() => handleRemoveWord(index)}
                  title="Xóa từ này"
                  style={{ background: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold' }}>
                  X
                </button>
                )}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '15px', alignItems: 'start' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)' }}>Từ (Word)</label>
                  <input 
                    type="text" 
                    className="premium-input" 
                    placeholder="VD: Apple" 
                    value={item.word} 
                    onChange={e => handleWordChange(index, 'word', e.target.value)} 
                    disabled={readOnly}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)' }}>Nghĩa (Meaning)</label>
                  <input 
                    type="text" 
                    className="premium-input" 
                    placeholder="VD: Quả táo" 
                    value={item.meaning} 
                    onChange={e => handleWordChange(index, 'meaning', e.target.value)} 
                    disabled={readOnly}
                  />
                </div>
                
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)' }}>Emoji</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="text" 
                      className="premium-input" 
                      placeholder="🍎" 
                      value={item.emoji} 
                      onChange={e => handleWordChange(index, 'emoji', e.target.value)}
                      style={{ textAlign: 'center', fontSize: '1.5rem', padding: '8px' }} 
                      disabled={readOnly}
                    />
                    <button 
                      type="button"
                      onClick={() => setActiveEmojiPicker(isPickerOpen ? null : index)}
                      style={{ padding: '0 10px', height: '52px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.15)', background: isPickerOpen ? 'var(--secondary)' : 'rgba(255,255,255,0.9)', color: isPickerOpen ? 'white' : 'inherit', cursor: 'pointer', fontSize: '1.5rem', transition: 'all 0.2s' }}
                      disabled={readOnly}
                    >
                      😀
                    </button>
                  </div>
                  
                  {isPickerOpen && (
                    <div style={{ position: 'absolute', top: '100%', right: '0', zIndex: 100, marginTop: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ background: '#fff', padding: '8px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Chọn Emoji</span>
                        <button onClick={() => setActiveEmojiPicker(null)} style={{ border: 'none', background: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 'bold' }}>Đóng X</button>
                      </div>
                      <EmojiPicker 
                        onEmojiClick={(emojiData) => {
                          handleWordChange(index, 'emoji', emojiData.emoji);
                          setActiveEmojiPicker(null); // Tự đóng khi chọn xong
                        }} 
                        width={300} height={350} searchPlaceholder="Tìm kiếm emoji..."
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!readOnly && words.length > 0 && (
        <button className="premium-btn" style={{ width: '100%', marginTop: '1rem', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)' }} onClick={handleSave}>
          Lưu Bài Học Lên Github ({words.length} từ)
        </button>
      )}
    </div>
  );
}
