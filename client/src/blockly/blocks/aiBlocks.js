import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

/**
 * AI 功能积木定义
 * 包含图像识别、文本生成等 AI 相关积木
 * 颜色优化：使用更友好的HSL颜色值
 */

// 颜色定义（更现代、更友好）
const COLORS = {
  AI: '#9333EA',        // 紫色 - AI功能 (purple-600)
  IO: '#10B981',        // 绿色 - 输入输出 (emerald-500)
  LOGIC: '#3B82F6',     // 蓝色 - 逻辑 (blue-500)
  MATH: '#F59E0B',      // 橙色 - 数学 (amber-500)
  TEXT: '#06B6D4',      // 青色 - 文本 (cyan-500)
  VARIABLE: '#EF4444'   // 红色 - 变量 (red-500)
};

// ===== 图像识别积木 =====
Blockly.Blocks['ai_image_recognition'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🖼️ 识别图片');
    this.appendValueInput('IMAGE')
        .setCheck('String')
        .appendField('图片:');
    this.appendValueInput('PROMPT')
        .setCheck('String')
        .appendField('提示词:');
    this.setOutput(true, 'String');
    this.setColour(COLORS.AI);
    this.setTooltip('使用 AI 识别图片内容');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['ai_image_recognition'] = function(block, generator) {
  const image = generator.valueToCode(block, 'IMAGE', javascriptGenerator.ORDER_ATOMIC) || '""';
  const prompt = generator.valueToCode(block, 'PROMPT', javascriptGenerator.ORDER_ATOMIC) || '"请描述这张图片"';

  const code = `await recognizeImage(${image}, ${prompt})`;
  return [code, javascriptGenerator.ORDER_AWAIT];
};

// ===== AI 文本生成积木 =====
Blockly.Blocks['ai_text_generate'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🤖 AI 生成文本');
    this.appendValueInput('PROMPT')
        .setCheck('String')
        .appendField('提示词:');
    this.setOutput(true, 'String');
    this.setColour(COLORS.AI);
    this.setTooltip('使用 AI 生成文本内容');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['ai_text_generate'] = function(block, generator) {
  const prompt = generator.valueToCode(block, 'PROMPT', javascriptGenerator.ORDER_ATOMIC) || '""';

  const code = `await generateText(${prompt})`;
  return [code, javascriptGenerator.ORDER_AWAIT];
};

// ===== 上传图片积木 =====
Blockly.Blocks['io_upload_image'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('📤 上传的图片');
    this.setOutput(true, 'String');
    this.setColour(COLORS.IO);
    this.setTooltip('获取用户上传的图片');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['io_upload_image'] = function(block, generator) {
  const code = 'getUploadedImage()';
  return [code, javascriptGenerator.ORDER_FUNCTION_CALL];
};

// ===== 显示结果积木 =====
Blockly.Blocks['io_display_result'] = {
  init: function() {
    this.appendValueInput('RESULT')
        .setCheck(null)
        .appendField('📺 显示结果:');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.IO);
    this.setTooltip('在预览区显示结果');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['io_display_result'] = function(block, generator) {
  const result = generator.valueToCode(block, 'RESULT', javascriptGenerator.ORDER_ATOMIC) || '""';

  const code = `displayResult(${result});\n`;
  return code;
};

// ===== 获取用户输入积木 =====
Blockly.Blocks['io_get_input'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('⌨️ 获取用户输入');
    this.appendValueInput('MESSAGE')
        .setCheck('String')
        .appendField('提示信息:');
    this.setOutput(true, 'String');
    this.setColour(COLORS.IO);
    this.setTooltip('获取用户在输入框中输入的内容');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['io_get_input'] = function(block, generator) {
  const message = generator.valueToCode(block, 'MESSAGE', javascriptGenerator.ORDER_ATOMIC) || '"请输入内容"';

  const code = `await getUserInput(${message})`;
  return [code, javascriptGenerator.ORDER_AWAIT];
};

// ===== 显示消息积木（新增）=====
Blockly.Blocks['io_show_message'] = {
  init: function() {
    this.appendValueInput('MESSAGE')
        .setCheck('String')
        .appendField('💬 显示消息:');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.IO);
    this.setTooltip('显示一条消息给用户');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['io_show_message'] = function(block, generator) {
  const message = generator.valueToCode(block, 'MESSAGE', javascriptGenerator.ORDER_ATOMIC) || '""';

  const code = `alert(${message});\n`;
  return code;
};

// ===== 等待积木 =====
Blockly.Blocks['logic_wait'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('⏱️ 等待')
        .appendField(new Blockly.FieldNumber(1, 0, 10, 0.1), 'SECONDS')
        .appendField('秒');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.LOGIC);
    this.setTooltip('暂停执行指定的秒数');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['logic_wait'] = function(block, generator) {
  const seconds = block.getFieldValue('SECONDS');

  const code = `await wait(${seconds});\n`;
  return code;
};

// ===== 如果...那么...积木（简化版，适合小学生）=====
Blockly.Blocks['logic_if_simple'] = {
  init: function() {
    this.appendValueInput('CONDITION')
        .setCheck('Boolean')
        .appendField('🔵 如果');
    this.appendStatementInput('DO')
        .appendField('那么');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.LOGIC);
    this.setTooltip('如果条件成立，执行下面的操作');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['logic_if_simple'] = function(block, generator) {
  const condition = generator.valueToCode(block, 'CONDITION', javascriptGenerator.ORDER_ATOMIC) || 'false';
  const doCode = generator.statementToCode(block, 'DO');

  const code = `if (${condition}) {\n${doCode}}\n`;
  return code;
};

// ===== 如果...那么...否则...积木 =====
Blockly.Blocks['logic_if_else'] = {
  init: function() {
    this.appendValueInput('CONDITION')
        .setCheck('Boolean')
        .appendField('🔵 如果');
    this.appendStatementInput('DO_TRUE')
        .appendField('那么');
    this.appendStatementInput('DO_FALSE')
        .appendField('否则');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.LOGIC);
    this.setTooltip('如果条件成立执行第一组操作，否则执行第二组操作');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['logic_if_else'] = function(block, generator) {
  const condition = generator.valueToCode(block, 'CONDITION', javascriptGenerator.ORDER_ATOMIC) || 'false';
  const doTrue = generator.statementToCode(block, 'DO_TRUE');
  const doFalse = generator.statementToCode(block, 'DO_FALSE');

  const code = `if (${condition}) {\n${doTrue}} else {\n${doFalse}}\n`;
  return code;
};

// ===== 重复...次积木 =====
Blockly.Blocks['loop_repeat'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🔁 重复')
        .appendField(new Blockly.FieldNumber(3, 1, 100, 1), 'TIMES')
        .appendField('次');
    this.appendStatementInput('DO')
        .appendField('执行');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.LOGIC);
    this.setTooltip('重复执行指定次数的操作');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['loop_repeat'] = function(block, generator) {
  const times = block.getFieldValue('TIMES');
  const doCode = generator.statementToCode(block, 'DO');

  const code = `for (let i = 0; i < ${times}; i++) {\n${doCode}}\n`;
  return code;
};

// ===== 数字比较积木 =====
Blockly.Blocks['logic_compare_number'] = {
  init: function() {
    this.appendValueInput('A')
        .setCheck('Number');
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['等于', '=='],
          ['大于', '>'],
          ['小于', '<'],
          ['大于等于', '>='],
          ['小于等于', '<='],
          ['不等于', '!=']
        ]), 'OP');
    this.appendValueInput('B')
        .setCheck('Number');
    this.setOutput(true, 'Boolean');
    this.setColour(COLORS.LOGIC);
    this.setTooltip('比较两个数字');
    this.setHelpUrl('');
    this.setInputsInline(true);
  }
};

javascriptGenerator.forBlock['logic_compare_number'] = function(block, generator) {
  const a = generator.valueToCode(block, 'A', javascriptGenerator.ORDER_ATOMIC) || '0';
  const b = generator.valueToCode(block, 'B', javascriptGenerator.ORDER_ATOMIC) || '0';
  const op = block.getFieldValue('OP');

  const code = `(${a} ${op} ${b})`;
  return [code, javascriptGenerator.ORDER_RELATIONAL];
};

// ===== 文本比较积木 =====
Blockly.Blocks['logic_compare_text'] = {
  init: function() {
    this.appendValueInput('A')
        .setCheck('String')
        .appendField('📝 文本');
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['等于', '=='],
          ['包含', 'includes']
        ]), 'OP');
    this.appendValueInput('B')
        .setCheck('String');
    this.setOutput(true, 'Boolean');
    this.setColour(COLORS.LOGIC);
    this.setTooltip('比较两个文本');
    this.setHelpUrl('');
    this.setInputsInline(true);
  }
};

javascriptGenerator.forBlock['logic_compare_text'] = function(block, generator) {
  const a = generator.valueToCode(block, 'A', javascriptGenerator.ORDER_ATOMIC) || '""';
  const b = generator.valueToCode(block, 'B', javascriptGenerator.ORDER_ATOMIC) || '""';
  const op = block.getFieldValue('OP');

  let code;
  if (op === 'includes') {
    code = `(${a}.includes(${b}))`;
  } else {
    code = `(${a} ${op} ${b})`;
  }
  return [code, javascriptGenerator.ORDER_RELATIONAL];
};

// ===== 文本积木 =====
Blockly.Blocks['text_value'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('文本'), 'TEXT');
    this.setOutput(true, 'String');
    this.setColour(COLORS.TEXT);
    this.setTooltip('文本值');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['text_value'] = function(block, generator) {
  const text = block.getFieldValue('TEXT');
  const code = `"${text}"`;
  return [code, javascriptGenerator.ORDER_ATOMIC];
};

// ===== 数字积木 =====
Blockly.Blocks['number_value'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldNumber(0), 'NUM');
    this.setOutput(true, 'Number');
    this.setColour(COLORS.MATH);
    this.setTooltip('数字值');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['number_value'] = function(block, generator) {
  const num = block.getFieldValue('NUM');
  return [num, javascriptGenerator.ORDER_ATOMIC];
};

// ===== 数学运算积木 =====
Blockly.Blocks['math_operation'] = {
  init: function() {
    this.appendValueInput('A')
        .setCheck('Number');
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['➕ 加', '+'],
          ['➖ 减', '-'],
          ['✖️ 乘', '*'],
          ['➗ 除', '/']
        ]), 'OP');
    this.appendValueInput('B')
        .setCheck('Number');
    this.setOutput(true, 'Number');
    this.setColour(COLORS.MATH);
    this.setTooltip('进行数学运算');
    this.setHelpUrl('');
    this.setInputsInline(true);
  }
};

javascriptGenerator.forBlock['math_operation'] = function(block, generator) {
  const a = generator.valueToCode(block, 'A', javascriptGenerator.ORDER_ATOMIC) || '0';
  const b = generator.valueToCode(block, 'B', javascriptGenerator.ORDER_ATOMIC) || '0';
  const op = block.getFieldValue('OP');

  const code = `(${a} ${op} ${b})`;
  return [code, javascriptGenerator.ORDER_MULTIPLICATIVE];
};

// ===== 文本拼接积木 =====
Blockly.Blocks['text_join_simple'] = {
  init: function() {
    this.appendValueInput('TEXT1')
        .setCheck('String')
        .appendField('📝 合并文本');
    this.appendValueInput('TEXT2')
        .setCheck('String')
        .appendField('和');
    this.setOutput(true, 'String');
    this.setColour(COLORS.TEXT);
    this.setTooltip('把两段文本拼接在一起');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['text_join_simple'] = function(block, generator) {
  const text1 = generator.valueToCode(block, 'TEXT1', javascriptGenerator.ORDER_ATOMIC) || '""';
  const text2 = generator.valueToCode(block, 'TEXT2', javascriptGenerator.ORDER_ATOMIC) || '""';

  const code = `(${text1} + ${text2})`;
  return [code, javascriptGenerator.ORDER_ADDITION];
};

// ===== 语音转文字积木 =====
Blockly.Blocks['voice_speech_to_text'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🎤 语音转文字');
    this.setOutput(true, 'String');
    this.setColour(COLORS.AI);
    this.setTooltip('将语音转换为文字');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['voice_speech_to_text'] = function(block, generator) {
  const code = `await speechToText()`;
  return [code, javascriptGenerator.ORDER_AWAIT];
};

// ===== 文字转语音积木 =====
Blockly.Blocks['voice_text_to_speech'] = {
  init: function() {
    this.appendValueInput('TEXT')
        .setCheck('String')
        .appendField('🔊 文字转语音:');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.AI);
    this.setTooltip('将文字转换为语音播放');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['voice_text_to_speech'] = function(block, generator) {
  const text = generator.valueToCode(block, 'TEXT', javascriptGenerator.ORDER_ATOMIC) || '""';

  const code = `await textToSpeech(${text});\n`;
  return code;
};

// ===== 机器人向前移动积木 =====
Blockly.Blocks['robot_move_forward'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🤖 机器人向前移动');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.AI);
    this.setTooltip('控制机器人向前移动');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['robot_move_forward'] = function(block, generator) {
  const code = `robotMoveForward();\n`;
  return code;
};

// ===== 机器人向后移动积木 =====
Blockly.Blocks['robot_move_backward'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🤖 机器人向后移动');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.AI);
    this.setTooltip('控制机器人向后移动');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['robot_move_backward'] = function(block, generator) {
  const code = `robotMoveBackward();\n`;
  return code;
};

// ===== 机器人左转积木 =====
Blockly.Blocks['robot_turn_left'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🤖 机器人左转');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.AI);
    this.setTooltip('控制机器人向左转');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['robot_turn_left'] = function(block, generator) {
  const code = `robotTurnLeft();\n`;
  return code;
};

// ===== 机器人右转积木 =====
Blockly.Blocks['robot_turn_right'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🤖 机器人右转');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.AI);
    this.setTooltip('控制机器人向右转');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['robot_turn_right'] = function(block, generator) {
  const code = `robotTurnRight();\n`;
  return code;
};

// ===== 机器人说话积木 =====
Blockly.Blocks['robot_say'] = {
  init: function() {
    this.appendValueInput('TEXT')
        .setCheck('String')
        .appendField('🤖 机器人说:');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.AI);
    this.setTooltip('让机器人说出指定文字');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['robot_say'] = function(block, generator) {
  const text = generator.valueToCode(block, 'TEXT', javascriptGenerator.ORDER_ATOMIC) || '""';

  const code = `robotSay(${text});\n`;
  return code;
};

// ===== 机器人检测障碍物积木 =====
Blockly.Blocks['robot_detect_obstacle'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🤖 检测障碍物');
    this.setOutput(true, 'Boolean');
    this.setColour(COLORS.AI);
    this.setTooltip('检测前方是否有障碍物');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['robot_detect_obstacle'] = function(block, generator) {
  const code = 'robotDetectObstacle()';
  return [code, javascriptGenerator.ORDER_FUNCTION_CALL];
};

// ===== Vision 视觉工坊积木 =====

// 摄像头拍照积木
Blockly.Blocks['vision_camera_capture'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('📷 拍摄照片');
    this.setOutput(true, 'String');
    this.setColour(COLORS.AI);
    this.setTooltip('使用摄像头拍摄一张照片');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['vision_camera_capture'] = function(block, generator) {
  const code = 'await captureFromCamera()';
  return [code, javascriptGenerator.ORDER_AWAIT];
};

// 识别物体积木
Blockly.Blocks['vision_recognize_object'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('👁️ 识别物体');
    this.appendValueInput('IMAGE')
        .setCheck('String')
        .appendField('图片:');
    this.setOutput(true, 'String');
    this.setColour(COLORS.AI);
    this.setTooltip('识别图片中的物体');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['vision_recognize_object'] = function(block, generator) {
  const image = generator.valueToCode(block, 'IMAGE', javascriptGenerator.ORDER_ATOMIC) || '""';
  const code = `await visionRecognizeObject(${image})`;
  return [code, javascriptGenerator.ORDER_AWAIT];
};

// 识别场景积木
Blockly.Blocks['vision_recognize_scene'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🏞️ 识别场景');
    this.appendValueInput('IMAGE')
        .setCheck('String')
        .appendField('图片:');
    this.setOutput(true, 'String');
    this.setColour(COLORS.AI);
    this.setTooltip('识别图片所在的场景');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['vision_recognize_scene'] = function(block, generator) {
  const image = generator.valueToCode(block, 'IMAGE', javascriptGenerator.ORDER_ATOMIC) || '""';
  const code = `await visionRecognizeScene(${image})`;
  return [code, javascriptGenerator.ORDER_AWAIT];
};

// 识别文字积木 (OCR)
Blockly.Blocks['vision_recognize_text'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('📝 识别文字');
    this.appendValueInput('IMAGE')
        .setCheck('String')
        .appendField('图片:');
    this.setOutput(true, 'String');
    this.setColour(COLORS.AI);
    this.setTooltip('识别图片中的文字（OCR）');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['vision_recognize_text'] = function(block, generator) {
  const image = generator.valueToCode(block, 'IMAGE', javascriptGenerator.ORDER_ATOMIC) || '""';
  const code = `await visionRecognizeText(${image})`;
  return [code, javascriptGenerator.ORDER_AWAIT];
};

// AI 生成图片积木
Blockly.Blocks['vision_generate_image'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🎨 AI 生成图片');
    this.appendValueInput('PROMPT')
        .setCheck('String')
        .appendField('描述:');
    this.appendDummyInput()
        .appendField('尺寸:')
        .appendField(new Blockly.FieldDropdown([
          ['512x512', '512x512'],
          ['768x768', '768x768'],
          ['1024x1024', '1024x1024']
        ]), 'SIZE');
    this.setOutput(true, 'String');
    this.setColour(COLORS.AI);
    this.setTooltip('根据文字描述生成图片');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['vision_generate_image'] = function(block, generator) {
  const prompt = generator.valueToCode(block, 'PROMPT', javascriptGenerator.ORDER_ATOMIC) || '"可爱的小狗"';
  const size = block.getFieldValue('SIZE');
  const code = `await visionGenerateImage(${prompt}, '${size}')`;
  return [code, javascriptGenerator.ORDER_AWAIT];
};

// 显示图片积木
Blockly.Blocks['vision_display_image'] = {
  init: function() {
    this.appendValueInput('IMAGE')
        .setCheck('String')
        .appendField('🖼️ 显示图片:');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.IO);
    this.setTooltip('在画廊中显示图片');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['vision_display_image'] = function(block, generator) {
  const image = generator.valueToCode(block, 'IMAGE', javascriptGenerator.ORDER_ATOMIC) || '""';
  const code = `displayImage(${image});\n`;
  return code;
};

// 当识别到...时积木（条件判断）
Blockly.Blocks['vision_when_detected'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🔍 当识别到');
    this.appendValueInput('TARGET')
        .setCheck('String');
    this.appendValueInput('IMAGE')
        .setCheck('String')
        .appendField('在图片');
    this.appendStatementInput('DO')
        .setCheck(null)
        .appendField('时，执行:');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.LOGIC);
    this.setTooltip('当识别结果包含指定内容时执行');
    this.setHelpUrl('');
  }
};

javascriptGenerator.forBlock['vision_when_detected'] = function(block, generator) {
  const target = generator.valueToCode(block, 'TARGET', javascriptGenerator.ORDER_ATOMIC) || '"苹果"';
  const image = generator.valueToCode(block, 'IMAGE', javascriptGenerator.ORDER_ATOMIC) || '""';
  const statements = generator.statementToCode(block, 'DO');

  const code = `
{
  const result = await visionRecognizeObject(${image});
  if (result && result.includes(${target})) {
${statements}
  }
}
`;
  return code;
};

export default {
  // 导出所有自定义积木，确保它们被注册
  blocks: [
    'ai_image_recognition',
    'ai_text_generate',
    'io_upload_image',
    'io_display_result',
    'io_get_input',
    'io_show_message',
    'logic_wait',
    'logic_if_simple',
    'logic_if_else',
    'loop_repeat',
    'logic_compare_number',
    'logic_compare_text',
    'text_value',
    'number_value',
    'math_operation',
    'text_join_simple',
    // 新增语音助手积木
    'voice_speech_to_text',
    'voice_text_to_speech',
    // 新增机器人积木
    'robot_move_forward',
    'robot_move_backward',
    'robot_turn_left',
    'robot_turn_right',
    'robot_say',
    'robot_detect_obstacle',
    // 新增 Vision 视觉工坊积木
    'vision_camera_capture',
    'vision_recognize_object',
    'vision_recognize_scene',
    'vision_recognize_text',
    'vision_generate_image',
    'vision_display_image',
    'vision_when_detected'
  ]
};

