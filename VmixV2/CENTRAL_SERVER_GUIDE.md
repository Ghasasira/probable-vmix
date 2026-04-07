# Central Server Integration Guide (vMix Logger)

This document provides details for the central server developer on how to receive and process data from the distributed vMix Logger instances.

## Endpoint Specification

**URL**: `https://vmix.hiilcom.ug/newdata`  
**Method**: `POST`  
**Content-Type**: `application/json`

## Request Body Structure

The request body contains the identifying name of the machine and an array of log objects.

```json
{
  "machine_name": "Studio-A-Production",
  "data": [
    {
      "id": 123,
      "played_at": "2026-04-02T10:53:07.452Z",
      "input_number": 5,
      "input_name": "Main Camera",
      "input_type": "Camera",
      "duration_ms": 0,
      "position_ms": 0,
      "loop": 0,
      "screenshot_path": "screenshots/input_5_1712055187452.jpg",
      "source": "tcp",
      "is_synced": 0
    },
    ...
  ]
}
```

### Field Definitions

| Field | Type | Description |
| :--- | :--- | :--- |
| `machine_name` | `string` | Unique identifier for the vMix Logger deployment. |
| `data` | `array` | A list of log entries captured since the last successful sync. |
| `data[].id` | `integer` | Local database ID (unique only to the originating machine). |
| `data[].played_at` | `string` | ISO 8601 timestamp of when the input went live. |
| `data[].input_number`| `integer` | The vMix input number. |
| `data[].input_name` | `string` | The title/name of the input in vMix. |
| `data[].input_type` | `string` | The type of input (e.g., Video, Camera, Image, NDI). |
| `data[].duration_ms` | `integer` | Total duration of the media in milliseconds (if applicable). |
| `data[].position_ms` | `integer` | The playback position when the log was captured. |
| `data[].loop` | `integer` | `1` if looping is enabled, `0` otherwise. |
| `data[].screenshot_path`| `string` | Relative path to the captured screenshot on the local machine. |
| `data[].source` | `string` | Tracking source (`tcp` or `http-poll`). |

## Response Requirements

The vMix Logger expects a successful HTTP status code to confirm that the data has been safely stored.

- **Success**: `200 OK` or `201 Created`
- **Any other status code** will be treated as a failure, and the logger will retry sending the same data in the next sync cycle (5 minutes later).

### Best Practices for Central Server
1.  **Deduplication**: Since network issues can occur, the central server should handle potential duplicates if a sync request is retried. Using a combination of `machine_name` and `played_at` as a unique constraint is recommended.
2.  **Performance**: If processing many logs, consider an asynchronous ingest queue to keep the response time fast.
