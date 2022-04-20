---
id: version-0.11.0-expand-volume
title: Expand Volume
sidebar_label: Expand Volume
original_id: expand-volume
---

IOMesh volumes can be expanded after creation, no matter whether they are being used or not.

In the following example, assume that there is a PVC named `example-pvc` and its capacity is `10Gi`:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: example-pvc
spec:
  storageClassName: iomesh-csi-driver-default
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi # original capacity
```

Apply the YAML file:

```bash
kubectl get pvc example-pvc
```

```output
NAME          STATUS   VOLUME                                     CAPACITY    ACCESS MODES   STORAGECLASS                AGE
example-pvc   Bound    pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca   10Gi        RWO            iomesh-csi-driver-default   11m
```

To expand the capacity of this PVC to `20Gi`, simply modify the PVC declaration:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: example-pvc
spec:
  storageClassName: iomesh-csi-driver-default
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi # now expand capacity from 10 Gi to 20Gi
```

Apply the new YAML file:

```bash
kubectl apply -f example-pvc.yaml
```

Then check the result:

```bash
kubectl get pvc example-pvc
```

```output
NAME          STATUS   VOLUME                                     CAPACITY    ACCESS MODES   STORAGECLASS                AGE
example-pvc   Bound    pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca   20Gi        RWO            iomesh-csi-driver-default   11m
```

```bash
kubectl get pv pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca
```

```output
NAME                                       CAPACITY   RECLAIM POLICY   STATUS   CLAIM                 STORAGECLASS
pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca   20Gi       Retain           Bound    default/example-pvc   iomesh-csi-driver-default
```
