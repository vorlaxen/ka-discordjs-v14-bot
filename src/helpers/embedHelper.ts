import { 
  EmbedBuilder, 
  Colors, 
  type APIEmbedField, 
  type EmbedAuthorData, 
  type EmbedFooterData, 
  type User,
  type ColorResolvable,
  type APIEmbed
} from "discord.js";

/**
 * Extended embed options interface with comprehensive customization
 */
export interface ExtendedEmbedOptions {
  /** Embed title (max 256 characters) */
  title?: string;
  /** Embed description (max 4096 characters) */
  description?: string;
  /** Custom color or predefined color name */
  color?: ColorResolvable | keyof typeof EmbedColors;
  /** URL for the embed title */
  url?: string;
  /** Timestamp options */
  timestamp?: Date | boolean | number;
  /** Array of embed fields (max 25 fields) */
  fields?: APIEmbedField[];
  /** Footer configuration */
  footer?: EmbedFooterData | string;
  /** Author configuration */
  author?: EmbedAuthorData | string;
  /** Large image at bottom of embed */
  image?: string | { url: string };
  /** Small image in top right corner */
  thumbnail?: string | { url: string };
  /** User for automatic footer generation */
  user?: User;
  /** Predefined embed type for styling */
  type?: EmbedType;
  /** Additional styling options */
  style?: EmbedStyle;
  /** Enable/disable default footer */
  showDefaultFooter?: boolean;
  /** Custom brand name for footer */
  brandName?: string;
  /** Enable field validation */
  validateFields?: boolean;
}

/**
 * Predefined embed types with semantic meaning
 */
export type EmbedType = 
  | "info" 
  | "success" 
  | "warning" 
  | "error" 
  | "loading"
  | "question"
  | "announcement"
  | "music"
  | "moderation"
  | "level"
  | "economy"
  | "game";

/**
 * Extended color palette for embeds
 */
export const EmbedColors = {
  // Discord default colors
  Primary: Colors.Blurple,
  Secondary: Colors.Grey,
  Success: Colors.Green,
  Warning: Colors.Orange,
  Error: Colors.Red,
  Info: Colors.Blue,
  
  // Extended palette
  Purple: 0x9b59b6,
  Pink: 0xe91e63,
  Red: Colors.Red,
  Cyan: 0x00bcd4,
  Teal: 0x009688,
  Lime: 0x8bc34a,
  Yellow: 0xffeb3b,
  Amber: 0xffc107,
  DeepOrange: 0xff5722,
  Brown: 0x795548,
  BlueGrey: 0x607d8b,
  
  // Special colors
  Gold: 0xffd700,
  Silver: 0xc0c0c0,
  Bronze: 0xcd7f32,
  Diamond: 0xb9f2ff,
  
  // Gradient-inspired
  Sunset: 0xff6b35,
  Ocean: 0x006994,
  Forest: 0x2d5016,
  Lavender: 0xe6e6fa,
  Mint: 0x98fb98
} as const;

export interface EmbedStyle {
  titleEmoji?: string;
  decorative?: boolean;
  gradient?: boolean;
  compact?: boolean;
}

export const EmbedTemplates = {
  success: (message: string, user?: User): ExtendedEmbedOptions => ({
    type: "success",
    title: "✅ Success",
    description: message,
    user,
    timestamp: true
  }),

  error: (message: string, user?: User): ExtendedEmbedOptions => ({
    type: "error",
    title: "Hata!",
    description: message,
    user,
    timestamp: true
  }),

  warning: (message: string, user?: User): ExtendedEmbedOptions => ({
    type: "warning",
    title: "Uyarı!",
    description: message,
    user,
    timestamp: true
  }),

  info: (message: string, user?: User): ExtendedEmbedOptions => ({
    type: "info",
    title: "Bilgilendirme",
    description: message,
    user,
    timestamp: true
  }),

  loading: (message: string = "Please wait..."): ExtendedEmbedOptions => ({
    type: "loading",
    title: "Yükleniyor...",
    description: message,
    timestamp: true
  })
};

export class EmbedUtils {
  static truncate(text: string, limit: number): string {
    if (text.length <= limit) return text;
    return text.substring(0, limit - 3) + "...";
  }

  static createPaginatedEmbeds(
    items: string[],
    itemsPerPage: number = 10,
    baseOptions: ExtendedEmbedOptions = {}
  ): ExtendedEmbedOptions[] {
    const pages: ExtendedEmbedOptions[] = [];
    const totalPages = Math.ceil(items.length / itemsPerPage);

    for (let i = 0; i < totalPages; i++) {
      const start = i * itemsPerPage;
      const end = start + itemsPerPage;
      const pageItems = items.slice(start, end);

      pages.push({
        ...baseOptions,
        description: pageItems.join('\n'),
        footer: `Page ${i + 1}/${totalPages} • ${baseOptions.footer || 'Powered by MomentumX ⚡'}`
      });
    }

    return pages;
  }

  static validate(options: ExtendedEmbedOptions): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (options.title && options.title.length > 256) {
      errors.push("Title exceeds 256 characters");
    }

    if (options.description && options.description.length > 4096) {
      errors.push("Description exceeds 4096 characters");
    }

    if (options.fields && options.fields.length > 25) {
      errors.push("Too many fields (max 25)");
    }

    if (options.fields) {
      options.fields.forEach((field, index) => {
        if (field.name.length > 256) {
          errors.push(`Field ${index + 1} name exceeds 256 characters`);
        }
        if (field.value.length > 1024) {
          errors.push(`Field ${index + 1} value exceeds 1024 characters`);
        }
      });
    }

    const totalLength = (options.title?.length || 0) + 
                       (options.description?.length || 0) + 
                       (options.fields?.reduce((sum, field) => sum + field.name.length + field.value.length, 0) || 0);

    if (totalLength > 6000) {
      errors.push("Total embed content exceeds 6000 characters");
    }

    return { valid: errors.length === 0, errors };
  }
}

export function createAdvancedEmbed(options: ExtendedEmbedOptions): EmbedBuilder {
  if (options.validateFields) {
    const validation = EmbedUtils.validate(options);
    if (!validation.valid) {
      throw new Error(`Embed validation failed: ${validation.errors.join(', ')}`);
    }
  }

  const embed = new EmbedBuilder();

  if (options.title) {
    const title = options.style?.titleEmoji 
      ? `${options.style.titleEmoji} ${options.title}`
      : options.title;
    embed.setTitle(EmbedUtils.truncate(title, 256));
  }

  if (options.description) {
    embed.setDescription(EmbedUtils.truncate(options.description, 4096));
  }

  if (options.color) {
    if (typeof options.color === 'string' && options.color in EmbedColors) {
      embed.setColor(EmbedColors[options.color as keyof typeof EmbedColors]);
    } else {
      embed.setColor(options.color as ColorResolvable);
    }
  } else if (options.type) {
    const colorMap: Record<EmbedType, ColorResolvable> = {
      info: EmbedColors.Info,
      success: EmbedColors.Success,
      warning: EmbedColors.Warning,
      error: EmbedColors.Error,
      loading: EmbedColors.Yellow,
      question: EmbedColors.Purple,
      announcement: EmbedColors.Gold,
      music: EmbedColors.Pink,
      moderation: EmbedColors.Red,
      level: EmbedColors.Lime,
      economy: EmbedColors.Gold,
      game: EmbedColors.Cyan
    };
    embed.setColor(colorMap[options.type] || EmbedColors.Primary);
  } else {
    embed.setColor(EmbedColors.Primary);
  }

  if (options.url) embed.setURL(options.url);

  if (options.timestamp === true) {
    embed.setTimestamp();
  } else if (options.timestamp instanceof Date) {
    embed.setTimestamp(options.timestamp);
  } else if (typeof options.timestamp === 'number') {
    embed.setTimestamp(new Date(options.timestamp));
  }

  if (options.fields && options.fields.length > 0) {
    const validatedFields = options.fields.slice(0, 25).map(field => ({
      ...field,
      name: EmbedUtils.truncate(field.name, 256),
      value: EmbedUtils.truncate(field.value, 1024)
    }));
    embed.addFields(validatedFields);
  }

  if (options.author) {
    if (typeof options.author === 'string') {
      embed.setAuthor({ name: EmbedUtils.truncate(options.author, 256) });
    } else {
      embed.setAuthor({
        ...options.author,
        name: EmbedUtils.truncate(options.author.name, 256)
      });
    }
  }

  if (options.image) {
    const imageUrl = typeof options.image === 'string' ? options.image : options.image.url;
    embed.setImage(imageUrl);
  }

  if (options.thumbnail) {
    const thumbnailUrl = typeof options.thumbnail === 'string' ? options.thumbnail : options.thumbnail.url;
    embed.setThumbnail(thumbnailUrl);
  }

  if (options.user) {
    embed.setFooter({
      text: `${options.showDefaultFooter !== false ? (options.brandName || 'Momentum') : ''}`,
      iconURL: options.user.displayAvatarURL({ extension: "png", size: 64 })
    });
  } else if (options.footer) {
    if (typeof options.footer === 'string') {
      embed.setFooter({ 
        text: EmbedUtils.truncate(options.footer, 2048)
      });
    } else {
      embed.setFooter({
        ...options.footer,
        text: EmbedUtils.truncate(options.footer.text, 2048)
      });
    }
  } else if (options.showDefaultFooter !== false) {
    embed.setFooter({
      text: `${options.brandName || 'Momentum'}`
    });
  }

  return embed;
}

export const QuickEmbeds = {
  success: (message: string, user?: User) => createAdvancedEmbed(EmbedTemplates.success(message, user)),
  error: (message: string, user?: User) => createAdvancedEmbed(EmbedTemplates.error(message, user)),
  warning: (message: string, user?: User) => createAdvancedEmbed(EmbedTemplates.warning(message, user)),
  info: (message: string, user?: User) => createAdvancedEmbed(EmbedTemplates.info(message, user)),
  loading: (message?: string) => createAdvancedEmbed(EmbedTemplates.loading(message))
};

export const createEmbed = createAdvancedEmbed;