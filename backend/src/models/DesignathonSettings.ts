import mongoose, { Document, Schema } from 'mongoose'
import { DESIGNATHON_CONFIG } from '../config/designathonConfig'

export interface IDesignathonSettings extends Document {
  eventId: string
  eventName: string
  slogan: string
  registrationOpens: Date
  registrationCloses: Date
  eventDate: string
  eventTime: string
  resultsAnnouncement: string
  feeRupees: number
  feePaise: number
  venue: string
  eventFormat: string
  judgingCriteria: string
  submissionInstructions: string
  participantLimit?: number
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
}

const DesignathonSettingsSchema = new Schema<IDesignathonSettings>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      default: DESIGNATHON_CONFIG.eventId,
      trim: true,
    },
    eventName: {
      type: String,
      required: true,
      default: DESIGNATHON_CONFIG.eventName,
      trim: true,
    },
    slogan: {
      type: String,
      required: true,
      default: DESIGNATHON_CONFIG.slogan,
      trim: true,
    },
    registrationOpens: {
      type: Date,
      required: true,
      default: () => new Date(DESIGNATHON_CONFIG.registrationOpens),
    },
    registrationCloses: {
      type: Date,
      required: true,
      default: () => new Date(DESIGNATHON_CONFIG.registrationCloses),
    },
    eventDate: {
      type: String,
      required: true,
      default: DESIGNATHON_CONFIG.eventDate,
      trim: true,
    },
    eventTime: {
      type: String,
      required: true,
      default: DESIGNATHON_CONFIG.eventTime,
      trim: true,
    },
    resultsAnnouncement: {
      type: String,
      required: true,
      default: DESIGNATHON_CONFIG.resultsAnnouncement,
      trim: true,
    },
    feeRupees: {
      type: Number,
      required: true,
      default: 49,
    },
    feePaise: {
      type: Number,
      required: true,
      default: 4900,
    },
    venue: {
      type: String,
      required: true,
      default: DESIGNATHON_CONFIG.venue,
      trim: true,
    },
    eventFormat: {
      type: String,
      required: true,
      default: DESIGNATHON_CONFIG.eventFormat,
      trim: true,
    },
    judgingCriteria: {
      type: String,
      required: true,
      default: DESIGNATHON_CONFIG.judgingCriteria,
      trim: true,
    },
    submissionInstructions: {
      type: String,
      required: true,
      default: DESIGNATHON_CONFIG.submissionInstructions,
      trim: true,
    },
    participantLimit: {
      type: Number,
      required: false,
    },
    updatedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

export const DesignathonSettings = mongoose.model<IDesignathonSettings>(
  'DesignathonSettings',
  DesignathonSettingsSchema
)

/**
 * Gets or initializes the singleton settings document for the event.
 */
export async function getOrInitDesignathonSettings(): Promise<IDesignathonSettings> {
  let settings = await DesignathonSettings.findOne({ eventId: DESIGNATHON_CONFIG.eventId })
  if (!settings) {
    settings = await DesignathonSettings.create({
      eventId: DESIGNATHON_CONFIG.eventId,
      eventName: DESIGNATHON_CONFIG.eventName,
      slogan: DESIGNATHON_CONFIG.slogan,
      registrationOpens: new Date(DESIGNATHON_CONFIG.registrationOpens),
      registrationCloses: new Date(DESIGNATHON_CONFIG.registrationCloses),
      eventDate: DESIGNATHON_CONFIG.eventDate,
      eventTime: DESIGNATHON_CONFIG.eventTime,
      resultsAnnouncement: DESIGNATHON_CONFIG.resultsAnnouncement,
      feeRupees: 49,
      feePaise: 4900,
      venue: DESIGNATHON_CONFIG.venue,
      eventFormat: DESIGNATHON_CONFIG.eventFormat,
      judgingCriteria: DESIGNATHON_CONFIG.judgingCriteria,
      submissionInstructions: DESIGNATHON_CONFIG.submissionInstructions,
    })
  } else if (settings.registrationOpens > new Date()) {
    settings.registrationOpens = new Date(DESIGNATHON_CONFIG.registrationOpens)
    await settings.save()
  }
  return settings
}

export default DesignathonSettings
