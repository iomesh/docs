---
id: expand-volume
title: Expand Volume
sidebar_label: Expand Volume
---

IOMesh volumes are allowed to be expanded after creation, no matter whether it is being used or not.

Here is an example. Assume that there is a PVC named example-pvc which capacity is 10Gi:

```bash
example-pvc.yaml
```

```output
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
      storage: 10Gi
```

```bash
kubectl get pvc example-pvc
```

```output
NAME          STATUS   VOLUME                                     CAPACITY    ACCESS MODES   STORAGECLASS                AGE
example-pvc   Bound    pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca   10Gi        RWO            iomesh-csi-driver-default   11m
```

To expand this PVC to 20Gi, just modify the PVC declaration:

```bash
example-pvc.yaml
```

```output
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
      storage: 20Gi # expand to 20Gi
```

Apply it to Kubernetes:

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
