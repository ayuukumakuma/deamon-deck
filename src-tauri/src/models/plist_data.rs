use serde::{Deserialize, Serialize};

use crate::error::AppError;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "value")]
pub enum PlistValue {
    String(String),
    Integer(i64),
    Real(f64),
    Boolean(bool),
    Array(Vec<PlistValue>),
    Dict(Vec<(String, PlistValue)>),
    Data(Vec<u8>),
    Date(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlistDocument {
    pub entries: Vec<(String, PlistValue)>,
}

impl PlistDocument {
    pub fn from_plist_value(value: plist::Value) -> Result<Self, AppError> {
        let dict = value
            .into_dictionary()
            .ok_or_else(|| AppError::ConfigError("Root plist value is not a dictionary".into()))?;
        let entries = dict
            .into_iter()
            .map(|(k, v)| (k, PlistValue::from(v)))
            .collect();
        Ok(Self { entries })
    }

    pub fn to_plist_value(&self) -> plist::Value {
        let dict: plist::Dictionary = self
            .entries
            .iter()
            .map(|(k, v)| (k.clone(), plist::Value::from(v.clone())))
            .collect();
        plist::Value::Dictionary(dict)
    }

    pub fn get(&self, key: &str) -> Option<&PlistValue> {
        self.entries.iter().find(|(k, _)| k == key).map(|(_, v)| v)
    }
}

impl From<plist::Value> for PlistValue {
    fn from(value: plist::Value) -> Self {
        match value {
            plist::Value::String(s) => PlistValue::String(s),
            plist::Value::Integer(i) => PlistValue::Integer(i.as_signed().unwrap_or(0)),
            plist::Value::Real(r) => PlistValue::Real(r),
            plist::Value::Boolean(b) => PlistValue::Boolean(b),
            plist::Value::Array(arr) => {
                PlistValue::Array(arr.into_iter().map(PlistValue::from).collect())
            }
            plist::Value::Dictionary(dict) => PlistValue::Dict(
                dict.into_iter()
                    .map(|(k, v)| (k, PlistValue::from(v)))
                    .collect(),
            ),
            plist::Value::Data(d) => PlistValue::Data(d),
            plist::Value::Date(d) => PlistValue::Date(d.to_xml_format()),
            _ => PlistValue::String("<unsupported>".into()),
        }
    }
}

impl From<PlistValue> for plist::Value {
    fn from(value: PlistValue) -> Self {
        match value {
            PlistValue::String(s) => plist::Value::String(s),
            PlistValue::Integer(i) => plist::Value::Integer(i.into()),
            PlistValue::Real(r) => plist::Value::Real(r),
            PlistValue::Boolean(b) => plist::Value::Boolean(b),
            PlistValue::Array(arr) => {
                plist::Value::Array(arr.into_iter().map(plist::Value::from).collect())
            }
            PlistValue::Dict(dict) => plist::Value::Dictionary(
                dict.into_iter()
                    .map(|(k, v)| (k, plist::Value::from(v)))
                    .collect(),
            ),
            PlistValue::Data(d) => plist::Value::Data(d),
            PlistValue::Date(d) => {
                let date = plist::Date::from_xml_format(&d).unwrap_or_else(|_| {
                    plist::Date::from_xml_format("2000-01-01T00:00:00Z").unwrap()
                });
                plist::Value::Date(date)
            }
        }
    }
}
