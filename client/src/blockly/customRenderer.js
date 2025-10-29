import * as Blockly from 'blockly/core';

/**
 * 自定义渲染器 - 现代化、圆润的积木块样式
 * 参考 Scratch 和现代 Agent 编程工具的视觉设计
 */
class ModernRenderer extends Blockly.blockRendering.Renderer {
  constructor(name) {
    super(name);
  }

  /**
   * 创建自定义常量对象
   */
  makeConstants_() {
    return new ModernConstantProvider();
  }
}

/**
 * 自定义常量提供者 - 定义积木块的视觉样式
 */
class ModernConstantProvider extends Blockly.blockRendering.ConstantProvider {
  constructor() {
    super();

    // 圆角半径 - 更大的圆角使积木块看起来更柔和
    this.CORNER_RADIUS = 8;

    // 凹口设置 - 连接处的形状
    this.NOTCH_WIDTH = 20;
    this.NOTCH_HEIGHT = 4;

    // 内联输入的圆角
    this.FIELD_BORDER_RECT_RADIUS = 6;

    // 积木块的内边距
    this.MIN_BLOCK_WIDTH = 80;
    this.MIN_BLOCK_HEIGHT = 32;

    // 语句输入的缩进
    this.STATEMENT_INPUT_NOTCH_OFFSET = 20;

    // 行间距
    this.MEDIUM_PADDING = 8;
    this.LARGE_PADDING = 12;

    // 底部连接器的间距
    this.BOTTOM_ROW_MIN_HEIGHT = 16;
    this.BOTTOM_ROW_AFTER_STATEMENT_MIN_HEIGHT = 16;

    // 顶部连接器的高度
    this.TOP_ROW_MIN_HEIGHT = 16;
    this.TOP_ROW_PRECEDES_STATEMENT_MIN_HEIGHT = 16;

    // 字段的垂直内边距
    this.FIELD_TEXT_BASELINE = 16;

    // 外部值输入的高度
    this.TALL_INPUT_FIELD_OFFSET_Y = 8;
  }

  /**
   * 初始化 - 在这里设置更多样式
   */
  init() {
    super.init();

    // 设置起始帽子路径（用于事件块）
    this.START_HAT_HEIGHT = 20;
    this.START_HAT_WIDTH = 100;

    // 修改拼图形连接器使其更圆润
    this.NOTCH_OFFSET_LEFT = 15;
    this.NOTCH_PATH_LEFT = this.makeNotch();
    this.NOTCH_PATH_RIGHT = this.makeNotch();

    // 内部输入的形状
    this.INSIDE_CORNERS = this.makeInsideCorners();
    this.OUTSIDE_CORNERS = this.makeOutsideCorners();
  }

  /**
   * 创建更圆润的凹口路径
   */
  makeNotch() {
    const width = this.NOTCH_WIDTH;
    const height = this.NOTCH_HEIGHT;
    const halfWidth = width / 2;

    // 使用三次贝塞尔曲线创建平滑的凹口
    return {
      width: width,
      height: height,
      pathLeft: `c 0,${height} ${halfWidth},${height} ${halfWidth},${height} ` +
                `c 0,0 ${halfWidth},0 ${halfWidth},-${height}`,
      pathRight: `c 0,${height} -${halfWidth},${height} -${halfWidth},${height} ` +
                 `c 0,0 -${halfWidth},0 -${halfWidth},-${height}`
    };
  }

  /**
   * 创建内部圆角
   */
  makeInsideCorners() {
    const radius = this.CORNER_RADIUS;
    return {
      width: radius,
      height: radius,
      pathTop: `a ${radius},${radius} 0 0,0 -${radius},${radius}`,
      pathBottom: `a ${radius},${radius} 0 0,0 ${radius},${radius}`
    };
  }

  /**
   * 创建外部圆角
   */
  makeOutsideCorners() {
    const radius = this.CORNER_RADIUS;
    return {
      topLeft: `a ${radius},${radius} 0 0,1 ${radius},${radius}`,
      topRight: `a ${radius},${radius} 0 0,1 ${radius},-${radius}`,
      bottomRight: `a ${radius},${radius} 0 0,1 -${radius},-${radius}`,
      bottomLeft: `a ${radius},${radius} 0 0,1 -${radius},${radius}`,
      rightHeight: radius
    };
  }

  /**
   * 获取拼图标签路径 - 用于连接点
   */
  shapeFor(connection) {
    const checks = connection.getCheck();

    // 根据类型返回不同的连接器形状
    if (!checks || checks.length === 0) {
      return this.NOTCH;
    }

    // 为 Boolean 类型使用六边形形状
    if (checks.includes('Boolean')) {
      return this.HEXAGONAL;
    }

    // 默认拼图形状
    return this.NOTCH;
  }
}

/**
 * 注册自定义渲染器
 */
Blockly.blockRendering.register('modern', ModernRenderer);

/**
 * 获取自定义主题配置
 */
export const getModernTheme = () => {
  return Blockly.Theme.defineTheme('modern', {
    'base': Blockly.Themes.Classic,
    'blockStyles': {
      // AI 相关块
      'ai_blocks': {
        'colourPrimary': '#9333EA',
        'colourSecondary': '#A855F7',
        'colourTertiary': '#7C3AED'
      },
      // 输入输出块
      'io_blocks': {
        'colourPrimary': '#10B981',
        'colourSecondary': '#34D399',
        'colourTertiary': '#059669'
      },
      // 逻辑块
      'logic_blocks': {
        'colourPrimary': '#3B82F6',
        'colourSecondary': '#60A5FA',
        'colourTertiary': '#2563EB'
      },
      // 数学块
      'math_blocks': {
        'colourPrimary': '#F59E0B',
        'colourSecondary': '#FBBF24',
        'colourTertiary': '#D97706'
      },
      // 文本块
      'text_blocks': {
        'colourPrimary': '#06B6D4',
        'colourSecondary': '#22D3EE',
        'colourTertiary': '#0891B2'
      },
      // 变量块
      'variable_blocks': {
        'colourPrimary': '#EF4444',
        'colourSecondary': '#F87171',
        'colourTertiary': '#DC2626'
      }
    },
    'categoryStyles': {
      'ai_category': {
        'colour': '#9333EA'
      },
      'io_category': {
        'colour': '#10B981'
      },
      'logic_category': {
        'colour': '#3B82F6'
      },
      'math_category': {
        'colour': '#F59E0B'
      },
      'text_category': {
        'colour': '#06B6D4'
      },
      'variable_category': {
        'colour': '#EF4444'
      }
    },
    'componentStyles': {
      'workspaceBackgroundColour': '#F9FAFB',
      'toolboxBackgroundColour': '#FFFFFF',
      'toolboxForegroundColour': '#374151',
      'flyoutBackgroundColour': '#F3F4F6',
      'flyoutForegroundColour': '#111827',
      'flyoutOpacity': 0.95,
      'scrollbarColour': '#D1D5DB',
      'insertionMarkerColour': '#6366F1',
      'insertionMarkerOpacity': 0.3,
      'scrollbarOpacity': 0.4,
      'cursorColour': '#6366F1',
      'blackBackground': '#1F2937'
    },
    'fontStyle': {
      'family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      'weight': '500',
      'size': 13
    },
    'startHats': true
  });
};

/**
 * 获取渲染器名称
 */
export const getRendererName = () => 'modern';

export default ModernRenderer;
