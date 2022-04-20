---
id: version-0.11.0-create-volume
title: Create Volume
sidebar_label: Create Volume
original_id: create-volume
---

A volume can be created by using the following YAML file. Users should ensure that the corresponding `StorageClass` already exists.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: iomesh-example-pvc
spec:
  storageClassName: iomesh-example-sc
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```
