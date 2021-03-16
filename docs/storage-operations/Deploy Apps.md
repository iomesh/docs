---
id: deployapps
title: Deploy Apps
sidebar_label: Deploy Apps
---

## Create PVCs

```yaml
# Declare pvc with StorageClass example-sc.
# Then get a file system of ext4, single replica, thin provisioned volume.
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: example-pvc
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: example-sc
```

